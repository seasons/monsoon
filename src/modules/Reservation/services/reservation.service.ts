import { RollbackError } from "@app/errors"
import { PushNotificationService } from "@app/modules/PushNotification"
import { AirtableService } from "@modules/Airtable"
import { EmailService } from "@modules/Email/services/email.service"
import {
  PhysicalProductUtilsService,
  ProductUtilsService,
  ProductVariantService,
} from "@modules/Product"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { ShippoTransaction } from "@modules/Shipping/shipping.types"
import { Injectable } from "@nestjs/common"
import {
  Customer,
  ID_Input,
  InventoryStatus,
  PhysicalProduct,
  PhysicalProductPromise,
  PhysicalProductStatus,
  Product,
  ProductVariant,
  Reservation,
  ReservationCreateInput,
  ReservationStatus,
  ReservationUpdateInput,
  ReservationWhereUniqueInput,
  User,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import * as Sentry from "@sentry/node"
import { ApolloError } from "apollo-server"
import { addFragmentToInfo } from "graphql-binding"
import { head } from "lodash"

import { ReservationUtilsService } from "./reservation.utils.service"

interface PhysicalProductWithProductVariant extends PhysicalProduct {
  productVariant: { id: ID_Input }
}

interface ProductState {
  productUID: string
  returned: boolean
  productStatus: PhysicalProductStatus
  notes: string
}

export interface ReservationWithProductVariantData {
  id: ID_Input
  status: ReservationStatus
  reservationNumber: number
  products: PhysicalProductWithProductVariant[]
}

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productUtils: ProductUtilsService,
    private readonly productVariantService: ProductVariantService,
    private readonly physicalProductUtilsService: PhysicalProductUtilsService,
    private readonly airtableService: AirtableService,
    private readonly shippingService: ShippingService,
    private readonly emails: EmailService,
    private readonly pushNotifs: PushNotificationService,
    private readonly reservationUtils: ReservationUtilsService
  ) {}

  async reserveItems(items: string[], user: User, customer: Customer, info) {
    let reservationReturnData
    const rollbackFuncs = []

    try {
      // Do a quick validation on the data
      if (items.length < 3) {
        throw new ApolloError(
          "Must supply at least three product variant ids",
          "515"
        )
      }

      // Figure out which items the user is reserving anew and which they already have
      const lastReservation = await this.reservationUtils.getLatestReservation(
        customer
      )
      this.checkLastReservation(lastReservation)
      const newProductVariantsBeingReserved = await this.getNewProductVariantsBeingReserved(
        lastReservation,
        items
      )
      const heldPhysicalProducts = await this.getHeldPhysicalProducts(
        customer,
        lastReservation
      )

      // Get product data, update variant counts, update physical product statuses
      const [
        productsBeingReserved,
        physicalProductsBeingReserved,
        rollbackUpdateProductVariantCounts,
      ] = await this.productVariantService.updateProductVariantCounts(
        newProductVariantsBeingReserved
      )
      rollbackFuncs.push(rollbackUpdateProductVariantCounts)
      // tslint:disable-next-line:max-line-length
      const rollbackPrismaPhysicalProductStatuses = await this.physicalProductUtilsService.markPhysicalProductsReservedOnPrisma(
        physicalProductsBeingReserved
      )
      rollbackFuncs.push(rollbackPrismaPhysicalProductStatuses)

      const [
        seasonsToCustomerTransaction,
        customerToSeasonsTransaction,
      ] = await this.shippingService.createReservationShippingLabels(
        newProductVariantsBeingReserved,
        user,
        customer
      )

      // Update relevant BagItems
      const rollbackBagItemsUpdate = await this.markBagItemsReserved(
        customer.id,
        newProductVariantsBeingReserved
      )
      rollbackFuncs.push(rollbackBagItemsUpdate)

      // Create reservation records in prisma and airtable
      const reservationData = await this.createReservationData(
        seasonsToCustomerTransaction,
        customerToSeasonsTransaction,
        user,
        customer,
        await this.shippingService.calcShipmentWeightFromProductVariantIDs(
          newProductVariantsBeingReserved as string[]
        ),
        physicalProductsBeingReserved,
        heldPhysicalProducts
      )
      const [
        prismaReservation,
        rollbackPrismaReservationCreation,
      ] = await this.createPrismaReservation(reservationData)
      rollbackFuncs.push(rollbackPrismaReservationCreation)
      try {
        const [
          ,
          rollbackAirtableReservationCreation,
        ] = await this.airtableService.createAirtableReservation(
          user.email,
          reservationData,
          (seasonsToCustomerTransaction as ShippoTransaction).formatted_error,
          (customerToSeasonsTransaction as ShippoTransaction).formatted_error
        )
        rollbackFuncs.push(rollbackAirtableReservationCreation)
      } catch (err) {
        console.log(err)
        Sentry.captureException(err)
      }

      // Send confirmation email
      await this.emails.sendReservationConfirmationEmail(
        user,
        productsBeingReserved,
        prismaReservation,
        seasonsToCustomerTransaction.tracking_number,
        seasonsToCustomerTransaction.tracking_url_provider
      )

      // Get return data
      reservationReturnData = await this.prisma.binding.query.reservation(
        { where: { id: prismaReservation.id } },
        addFragmentToInfo(info, `fragment EnsureId on Reservation {id}`)
      )
    } catch (err) {
      for (const rollbackFunc of rollbackFuncs) {
        try {
          await rollbackFunc()
        } catch (err2) {
          Sentry.configureScope(scope => {
            scope.setTag("flag", "data-corruption")
            scope.setExtra(`item ids`, `${items}`)
            scope.setExtra(`original error`, err)
          })
          Sentry.captureException(new RollbackError(err2))
        }
      }
      throw err
    }

    return reservationReturnData
  }

  async getReservation(reservationNumber: number) {
    return await this.prisma.binding.query.reservation(
      {
        where: { reservationNumber },
      },
      `{
          id
          status
          reservationNumber
          products {
              id
              productStatus
              inventoryStatus
              seasonsUID
              productVariant {
                  id
              }
          }
          customer {
              id
              detail {
                  shippingAddress {
                      slug
                  }
              }
          }
          user {
            id
            email
          }
          returnedPackage {
              id
          }
      }`
    )
  }

  async processReservation(reservationNumber, productStates: ProductState[]) {
    const receiptData = {
      reservation: {
        connect: {
          reservationNumber,
        },
      },
      items: {
        create: productStates
          .filter(a => a.returned)
          .map(productState => {
            return {
              product: {
                connect: {
                  seasonsUID: productState.productUID,
                },
              },
              productStatus: productState.productStatus,
              notes: productState.notes,
            }
          }),
      },
    }

    // Update status on physical products depending on whether
    // the item was returned, and update associated product variant counts
    const promises = productStates.map(
      async ({ productUID, productStatus, returned }) => {
        const seasonsUID = productUID
        const updateData: any = {
          productStatus,
        }
        if (returned) {
          const physProdBeforeUpdates = await this.prisma.binding.query.physicalProduct(
            { where: { seasonsUID } },
            `{
              inventoryStatus
              productVariant {
                id
              }
            }`
          )
          updateData.inventoryStatus = await this.getReturnedPhysicalProductInventoryStatus(
            seasonsUID
          )
          return Promise.all([
            this.prisma.client.createPhysicalProductInventoryStatusChange({
              old: physProdBeforeUpdates.inventoryStatus,
              new: updateData.inventoryStatus,
              physicalProduct: { connect: { seasonsUID } },
            }),
            this.productVariantService.updateCountsForStatusChange({
              id: physProdBeforeUpdates.productVariant.id,
              oldInventoryStatus: physProdBeforeUpdates.inventoryStatus,
              newInventoryStatus: updateData.inventoryStatus,
            }),
            this.prisma.client.updatePhysicalProduct({
              where: { seasonsUID },
              data: updateData,
            }),
          ])
        }
      }
    )

    await Promise.all(promises)

    // Create reservation receipt
    await this.prisma.client.createReservationReceipt(receiptData)

    const reservation = await this.getReservation(reservationNumber)

    const returnedPhysicalProducts = reservation.products.filter(p => {
      const physicalProduct = productStates.find(
        s => s.productUID === p.seasonsUID
      )
      return physicalProduct.returned
    })

    const prismaUser = await this.prisma.client.user({
      email: reservation.user.email,
    })

    // Mark reservation as completed
    await this.prisma.client.updateReservation({
      data: { status: "Completed" },
      where: { reservationNumber },
    })

    await this.reservationUtils.updateUsersBagItemsOnCompletedReservation(
      reservation,
      returnedPhysicalProducts
    )

    await this.reservationUtils.updateReturnPackageOnCompletedReservation(
      reservation,
      returnedPhysicalProducts
    )

    // Create reservationFeedback datamodels for the returned product variants
    await this.createReservationFeedbacksForVariants(
      await this.prisma.client.productVariants({
        where: {
          id_in: returnedPhysicalProducts.map(p => p.productVariant.id),
        },
      }),
      prismaUser,
      reservation as Reservation
    )

    await this.pushNotifs.pushNotifyUser({
      email: prismaUser.email,
      pushNotifID: "ResetBag",
    })
    await this.emails.sendYouCanNowReserveAgainEmail(prismaUser)

    await this.emails.sendAdminConfirmationEmail(
      prismaUser,
      returnedPhysicalProducts,
      reservation
    )
  }

  async updateReservation(
    data: ReservationUpdateInput,
    where: ReservationWhereUniqueInput,
    info: any
  ) {
    const reservationBeforeUpdate = await this.prisma.binding.query.reservation(
      { where },
      `{
        status
        products {
          id
        }
      }`
    )
    await this.prisma.client.updateReservation({ data, where })

    // Reservation was just packed. Null out warehouse locations on attached products
    if (
      data.status === "Packed" &&
      data.status !== reservationBeforeUpdate.status
    ) {
      await Promise.all(
        reservationBeforeUpdate.products.map(a =>
          this.prisma.client.updatePhysicalProduct({
            where: { id: a.id },
            data: { warehouseLocation: { disconnect: true } },
          })
        )
      )
    }

    return this.prisma.binding.query.reservation({ where }, info)
  }

  private async createReservationFeedbacksForVariants(
    productVariants: ProductVariant[],
    user: User,
    reservation: Reservation
  ) {
    const MULTIPLE_CHOICE = "MultipleChoice"
    const variantInfos = await Promise.all(
      productVariants.map(async variant => {
        const products: Product[] = await this.prisma.client.products({
          where: {
            variants_some: {
              id: variant.id,
            },
          },
        })
        if (!products || products.length === 0) {
          throw new Error(
            `createReservationFeedback error: Unable to find product for product variant id ${variant.id}.`
          )
        }
        return {
          id: variant.id,
          name: products[0].name,
          retailPrice: products[0].retailPrice,
        }
      })
    )
    await this.prisma.client.createReservationFeedback({
      feedbacks: {
        create: variantInfos.map(variantInfo => ({
          isCompleted: false,
          questions: {
            create: [
              {
                question: `How many times did you wear this ${variantInfo.name}?`,
                options: {
                  set: [
                    "More than 6 times",
                    "3-5 times",
                    "1-2 times",
                    "0 times",
                  ],
                },
                type: MULTIPLE_CHOICE,
              },
              {
                question: `Would you buy it at retail for $${variantInfo.retailPrice}?`,
                options: {
                  set: [
                    "Would buy at a discount",
                    "Buy below retail",
                    "Buy at retail",
                    "Would only rent",
                  ],
                },
                type: MULTIPLE_CHOICE,
              },
              {
                question: `Did it fit as expected?`,
                options: {
                  set: [
                    "Fit too big",
                    "Fit true to size",
                    "Ran small",
                    "Didn’t fit at all",
                  ],
                },
                type: MULTIPLE_CHOICE,
              },
            ],
          },
          variant: { connect: { id: variantInfo.id } },
        })),
      },
      user: {
        connect: {
          id: user.id,
        },
      },
      reservation: {
        connect: { id: reservation.id },
      },
    })
  }

  private checkLastReservation(
    lastReservation: ReservationWithProductVariantData
  ) {
    if (
      !!lastReservation &&
      ![
        "Completed" as ReservationStatus,
        "Cancelled" as ReservationStatus,
      ].includes(lastReservation.status)
    ) {
      throw new ApolloError(
        `Last reservation has non-completed, non-cancelled status. Last Reservation number, status: ${lastReservation.reservationNumber}, ${lastReservation.status}`
      )
    }
  }

  private async getNewProductVariantsBeingReserved(
    lastReservation: ReservationWithProductVariantData,
    items: ID_Input[]
  ): Promise<ID_Input[]> {
    return new Promise(async (resolve, reject) => {
      if (lastReservation == null) {
        return resolve(items)
      }
      const productVariantsInLastReservation = lastReservation.products.map(
        prod => prod.productVariant.id
      )
      const newProductVariantBeingReserved = items.filter(prodVarId => {
        const notInLastReservation = !productVariantsInLastReservation.includes(
          prodVarId as string
        )
        const inLastReservationButNowReservable =
          productVariantsInLastReservation.includes(prodVarId as string) &&
          this.reservationUtils.inventoryStatusOf(
            lastReservation,
            prodVarId
          ) === "Reservable"

        return notInLastReservation || inLastReservationButNowReservable
      })

      resolve(newProductVariantBeingReserved)
    })
  }

  private async getHeldPhysicalProducts(
    customer: Customer,
    lastReservation: ReservationWithProductVariantData
  ): Promise<PhysicalProduct[]> {
    if (lastReservation == null) return []

    const reservedBagItems = await this.productUtils.getReservedBagItems(
      customer
    )
    const reservedProductVariantIds = reservedBagItems.map(
      a => a.productVariant.id
    )

    return lastReservation.products
      .filter(prod => prod.inventoryStatus === "Reserved")
      .filter(a =>
        reservedProductVariantIds.includes(a.productVariant.id as string)
      )
  }

  private async markBagItemsReserved(
    customerId: ID_Input,
    productVariantIds: ID_Input[]
  ): Promise<() => void> {
    const bagItemsToUpdateIds = (
      await this.prisma.client.bagItems({
        where: {
          customer: {
            id: customerId,
          },
          productVariant: {
            id_in: productVariantIds,
          },
          status: "Added",
          saved: false,
        },
      })
    ).map(a => a.id)

    await this.prisma.client.updateManyBagItems({
      where: { id_in: bagItemsToUpdateIds },
      data: {
        status: "Reserved",
      },
    })

    const rollbackAddedBagItems = async () => {
      await this.prisma.client.updateManyBagItems({
        where: { id_in: bagItemsToUpdateIds },
        data: {
          status: "Added",
        },
      })
    }
    return rollbackAddedBagItems
  }

  private async createReservationData(
    seasonsToCustomerTransaction,
    customerToSeasonsTransaction,
    user: User,
    customer: Customer,
    shipmentWeight: number,
    physicalProductsBeingReserved: PhysicalProduct[],
    heldPhysicalProducts: PhysicalProduct[]
  ): Promise<ReservationCreateInput> {
    const allPhysicalProductsInReservation = [
      ...physicalProductsBeingReserved,
      ...heldPhysicalProducts,
    ]
    if (allPhysicalProductsInReservation.length > 3) {
      throw new ApolloError("Can not reserve more than 3 items at a time")
    }
    const physicalProductSUIDs = allPhysicalProductsInReservation.map(p => ({
      seasonsUID: p.seasonsUID,
    }))

    const customerShippingAddressRecordID = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
      .shippingAddress()
      .id()
    interface UniqueIDObject {
      id: string
    }
    const uniqueReservationNumber = await this.reservationUtils.getUniqueReservationNumber()

    return {
      products: {
        connect: physicalProductSUIDs,
      },
      customer: {
        connect: {
          id: customer.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
      phase: "BusinessToCustomer",
      sentPackage: {
        create: {
          transactionID: seasonsToCustomerTransaction.object_id,
          weight: shipmentWeight,
          items: {
            // need to include the type on the function passed into map
            // or we get build errors comlaining about the type here
            connect: physicalProductsBeingReserved.map(
              (prod): UniqueIDObject => {
                return { id: prod.id }
              }
            ),
          },
          shippingLabel: {
            create: {
              image: seasonsToCustomerTransaction.label_url || "",
              trackingNumber:
                seasonsToCustomerTransaction.tracking_number || "",
              trackingURL:
                seasonsToCustomerTransaction.tracking_url_provider || "",
              name: "UPS",
            },
          },
          fromAddress: {
            connect: {
              slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
            },
          },
          toAddress: {
            connect: { id: customerShippingAddressRecordID },
          },
        },
      },
      returnedPackage: {
        create: {
          transactionID: customerToSeasonsTransaction.object_id,
          shippingLabel: {
            create: {
              image: customerToSeasonsTransaction.label_url || "",
              trackingNumber:
                customerToSeasonsTransaction.tracking_number || "",
              trackingURL:
                customerToSeasonsTransaction.tracking_url_provider || "",
              name: "UPS",
            },
          },
          fromAddress: {
            connect: {
              id: customerShippingAddressRecordID,
            },
          },
          toAddress: {
            connect: {
              slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
            },
          },
        },
      },
      reservationNumber: uniqueReservationNumber,
      lastLocation: {
        connect: {
          slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
        },
      },
      shipped: false,
      status: "Queued",
    }
  }

  /* Returns [createdReservation, rollbackFunc] */
  private async createPrismaReservation(
    reservationData: ReservationCreateInput
  ): Promise<[Reservation, () => void]> {
    const reservation = await this.prisma.client.createReservation(
      reservationData
    )

    const rollbackPrismaReservation = async () => {
      await this.prisma.client.deleteReservation({ id: reservation.id })
    }
    return [reservation, rollbackPrismaReservation]
  }

  private async getReturnedPhysicalProductInventoryStatus(
    seasonsUID: string
  ): Promise<InventoryStatus> {
    const parentProduct = head(
      await this.prisma.client.products({
        where: { variants_some: { physicalProducts_some: { seasonsUID } } },
      })
    )

    if (parentProduct.status === "Stored") {
      return "Stored"
    }

    return "NonReservable"
  }
}
