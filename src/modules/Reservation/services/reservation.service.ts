import { RollbackError } from "@app/errors"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { PaymentService } from "@app/modules/Payment/services/payment.service"
import { PushNotificationService } from "@app/modules/PushNotification"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { EmailService } from "@modules/Email/services/email.service"
import {
  PhysicalProductUtilsService,
  ProductUtilsService,
  ProductVariantService,
} from "@modules/Product"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable } from "@nestjs/common"
import { Prisma, PrismaPromise } from "@prisma/client"
import {
  AdminActionLog,
  Customer,
  ID_Input,
  InventoryStatus,
  PhysicalProduct,
  PhysicalProductStatus,
  Product,
  ProductVariant,
  Reservation,
  ReservationCreateInput,
  ReservationStatus,
  ReservationUpdateInput,
  ReservationWhereUniqueInput,
  ShippingCode,
  User,
} from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import * as Sentry from "@sentry/node"
import { ApolloError } from "apollo-server"
import { addFragmentToInfo } from "graphql-binding"
import { head, intersection } from "lodash"

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
    private readonly payment: PaymentService,
    private readonly productUtils: ProductUtilsService,
    private readonly productVariantService: ProductVariantService,
    private readonly physicalProductUtilsService: PhysicalProductUtilsService,
    private readonly shippingService: ShippingService,
    private readonly emails: EmailService,
    private readonly pushNotifs: PushNotificationService,
    private readonly reservationUtils: ReservationUtilsService,
    private readonly error: ErrorService,
    private readonly utils: UtilsService
  ) {}

  async reserveItems(
    items: string[],
    shippingCode: ShippingCode,
    user: User,
    customer: Customer,
    info
  ) {
    if (customer.status !== "Active") {
      throw new Error(`Only Active customers can place a reservation`)
    }

    let reservationReturnData
    const rollbackFuncs = []

    const customerWithPlanItemCount = await this.prisma.client2.customer.findUnique(
      {
        where: { id: customer.id },
        select: {
          membership: { select: { plan: { select: { itemCount: true } } } },
        },
      }
    )
    const customerPlanItemCount =
      customerWithPlanItemCount?.membership?.plan?.itemCount

    try {
      // Do a quick validation on the data
      if (!!customerPlanItemCount && items.length !== customerPlanItemCount) {
        throw new ApolloError(
          `Your reservation must contain ${customerPlanItemCount} items`,
          "515"
        )
      }

      // Figure out which items the user is reserving anew and which they already have
      const lastReservation = await this.reservationUtils.getLatestReservation(
        customer
      )
      this.checkLastReservation(lastReservation)
      const lastCompletedReservation = !!lastReservation
        ? lastReservation.status === "Completed"
          ? lastReservation
          : await this.reservationUtils.getLatestReservation(
              customer,
              "Completed"
            )
        : null
      const newProductVariantsBeingReserved = await this.getNewProductVariantsBeingReserved(
        { productVariantIDs: items, customerId: customer.id }
      )
      const heldPhysicalProducts = await this.getHeldPhysicalProducts(
        customer,
        lastCompletedReservation
      )

      // Get product data, update variant counts, update physical product statuses
      const [
        productsBeingReserved,
        physicalProductsBeingReserved,
        rollbackUpdateProductVariantCounts,
      ] = await this.productVariantService.updateProductVariantCounts(
        newProductVariantsBeingReserved,
        customer.id
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
        customer,
        shippingCode
      )

      // Update relevant BagItems
      const rollbackBagItemsUpdate = await this.markBagItemsReserved(
        customer.id,
        newProductVariantsBeingReserved
      )
      rollbackFuncs.push(rollbackBagItemsUpdate)

      // Create one time charge for shipping addon
      let shippingOptionID
      if (!!shippingCode) {
        shippingOptionID = await this.payment.addShippingCharge(
          customer,
          shippingCode
        )
      }

      // Create reservation records in prisma
      const reservationData = await this.createReservationData(
        seasonsToCustomerTransaction,
        customerToSeasonsTransaction,
        user,
        customer,
        await this.shippingService.calcShipmentWeightFromProductVariantIDs(
          newProductVariantsBeingReserved as string[]
        ),
        physicalProductsBeingReserved,
        heldPhysicalProducts,
        shippingOptionID
      )
      const [
        prismaReservation,
        rollbackPrismaReservationCreation,
      ] = await this.createPrismaReservation(reservationData)
      rollbackFuncs.push(rollbackPrismaReservationCreation)

      // Send confirmation email
      await this.emails.sendReservationConfirmationEmail(
        user,
        productsBeingReserved,
        prismaReservation,
        seasonsToCustomerTransaction.tracking_number,
        seasonsToCustomerTransaction.tracking_url_provider
      )

      try {
        await this.removeRestockNotifications(items, customer)
      } catch (err) {
        this.error.setUserContext(user)
        this.error.setExtraContext({ items })
        this.error.captureError(err)
      }

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

  async returnItems(items: string[], customer: Customer) {
    const lastReservation = await this.reservationUtils.getLatestReservation(
      customer
    )

    // If there's an item being returned that isn't in the current reservation
    // throw an error
    if (
      intersection(
        lastReservation.products.map(p => p.id),
        items
      ).length !== items.length
    ) {
      throw new Error(
        "One of the returned items isn't in the current reservation"
      )
    }

    await this.prisma.client2.reservation.update({
      data: {
        returnedProducts: {
          set: items.map(item => ({ id: item })),
        },
        returnedAt: new Date(),
      },
      where: { id: String(lastReservation.id) },
    })

    return lastReservation
  }

  async removeRestockNotifications(items, customer) {
    const restockNotifications = await this.prisma.client.productNotifications({
      where: {
        customer: {
          id: customer.id,
        },
        AND: {
          productVariant: {
            id_in: items,
          },
        },
      },
      orderBy: "createdAt_DESC",
    })

    if (restockNotifications?.length > 0) {
      await this.prisma.client.updateManyProductNotifications({
        where: { id_in: restockNotifications.map(notif => notif.id) },
        data: {
          shouldNotify: false,
        },
      })
    }
  }

  async getReservation(reservationNumber: number) {
    const data = await this.prisma.client2.reservation.findUnique({
      where: {
        reservationNumber,
      },
      select: {
        id: true,
        status: true,
        reservationNumber: true,
        products: {
          select: {
            id: true,
            productStatus: true,
            inventoryStatus: true,
            seasonsUID: true,
            productVariant: { select: { id: true } },
          },
        },
        customer: {
          select: {
            id: true,
            detail: {
              select: {
                shippingAddress: {
                  select: {
                    slug: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        returnedPackage: {
          select: {
            id: true,
          },
        },
      },
    })
    return this.prisma.sanitizePayload(data, "Reservation")
  }

  async processReservation(reservationNumber, productStates: ProductState[]) {
    // Update status on physical products depending on whether
    // the item was returned, and update associated product variant counts
    const promises = productStates
      .map(async ({ productUID, productStatus, returned }) => {
        const seasonsUID = productUID
        const updateData: any = {
          productStatus,
        }
        if (returned) {
          const _physProdBeforeUpdates = await this.prisma.client2.physicalProduct.findUnique(
            {
              where: {
                seasonsUID,
              },
              select: {
                id: true,
                inventoryStatus: true,
                productVariant: { select: { id: true } },
              },
            }
          )
          const physProdBeforeUpdates = this.prisma.sanitizePayload(
            _physProdBeforeUpdates,
            "PhysicalProduct"
          )

          updateData.inventoryStatus = await this.getReturnedPhysicalProductInventoryStatus(
            seasonsUID
          )

          return [
            (this.productVariantService.updateCountsForStatusChange({
              id: physProdBeforeUpdates.productVariant.id,
              oldInventoryStatus: physProdBeforeUpdates.inventoryStatus as InventoryStatus,
              newInventoryStatus: updateData.inventoryStatus,
            }) as unknown) as PrismaPromise<ProductVariant>,
            this.prisma.client2.physicalProduct.update({
              where: { seasonsUID },
              data: updateData,
            }),
          ]
        }
      })
      .filter(Boolean)

    await this.prisma.client2.$transaction(
      promises.flat() as PrismaPromise<any>[]
    )

    await this.prisma.client2.reservationReceipt.create({
      data: {
        reservation: {
          connect: { reservationNumber },
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
        createdAt: new Date(),
      },
    })

    const reservation = await this.getReservation(reservationNumber)

    const returnedPhysicalProducts = reservation.products.filter(p => {
      const physicalProduct = productStates.find(
        s => s.productUID === p.seasonsUID
      )
      return physicalProduct.returned
    })

    const prismaUser = await this.prisma.client2.user.findUnique({
      where: {
        email: reservation.user.email,
      },
    })

    // Mark reservation as completed
    await this.prisma.client2.reservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        status: "Completed",
        returnedAt: new Date(),
        returnedProducts: {
          connect: productStates
            .filter(a => a.returned)
            .map(productState => ({
              seasonsUID: productState.productUID,
            })),
        },
      },
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
      await this.prisma.client2.productVariant.findMany({
        where: {
          id: { in: returnedPhysicalProducts.map(p => p.productVariant.id) },
        },
      }),
      prismaUser,
      reservation
    )

    await this.pushNotifs.pushNotifyUsers({
      emails: [prismaUser.email],
      pushNotifID: "ResetBag",
    })
    await this.emails.sendYouCanNowReserveAgainEmail(prismaUser)

    await this.emails.sendAdminConfirmationEmail(
      prismaUser,
      returnedPhysicalProducts,
      reservation
    )
  }

  interpretReservationLogs(logs: AdminActionLog[]) {
    // for now, just filter these out of the changed logs
    const keysWeDontCareAbout = [
      "receipt",
      "id",
      "sentPackage",
      "returnedPackage",
    ]

    return this.utils.filterAdminLogs(logs, keysWeDontCareAbout)
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

    // If we're completing or cancelling the resy, set the timestamp
    if (
      reservationBeforeUpdate.status !== "Cancelled" &&
      data.status === "Cancelled"
    ) {
      data["cancelledAt"] = new Date()
    }
    if (
      reservationBeforeUpdate.status !== "Completed" &&
      data.status === "Completed"
    ) {
      data["completedAt"] = new Date()
    }

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

  async createReservationFeedbacksForVariants(
    productVariants,
    user,
    reservation
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
                question: `What did you think about this?`,
                options: {
                  set: ["Disliked", "It was OK", "Loved it"],
                },
                type: MULTIPLE_CHOICE,
              },
              {
                question: `How many times did you wear this?`,
                options: {
                  set: [
                    "Never wore it",
                    "1-2 times",
                    "3-5 times",
                    "More than 6 times",
                  ],
                },
                type: MULTIPLE_CHOICE,
              },
              {
                question: `Did it fit as expected?`,
                options: {
                  set: ["Fit small", "Fit true to size", "Fit oversized"],
                },
                type: MULTIPLE_CHOICE,
              },
              {
                question: `Would you buy it at retail for $${variantInfo.retailPrice}?`,
                options: {
                  set: ["No", "Yes", "Buy below retail", "Would only rent"],
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

  private checkLastReservation(lastReservation) {
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

  private async getNewProductVariantsBeingReserved({
    productVariantIDs,
    customerId,
  }: {
    productVariantIDs: string[]
    customerId: string
  }): Promise<string[]> {
    const _customerReservations = await this.prisma.client2.reservation.findMany(
      {
        where: { customer: { id: customerId } },
        orderBy: { createdAt: "desc" }, // reverse chronological order
        select: {
          id: true,
          createdAt: true,
          status: true,
          products: {
            select: {
              id: true,
              seasonsUID: true,
              productVariant: { select: { id: true } },
              inventoryStatus: true,
            },
          },
        },
      }
    )
    const customerReservations = this.prisma.sanitizePayload(
      _customerReservations,
      "Reservation"
    )

    const lastCompletedReservation = customerReservations.find(
      a => a.status === "Completed"
    )
    const indexOfLastCompletedReservation = customerReservations.findIndex(
      a => a.status === "Completed"
    )
    const cancelledReservationssSinceLastCompletedReservation = [
      ...customerReservations,
    ].splice(0, indexOfLastCompletedReservation)

    // If they don't have any reservation history, all items are new.
    if (!lastCompletedReservation) {
      return productVariantIDs
    }

    const newVariantsBeingReserved = []
    const productVariantsInLastCompletedReservation = lastCompletedReservation.products.map(
      prod => (prod.productVariant as any).id
    )
    productVariantIDs.forEach(id => {
      // If it's not in the last completed reservation, its new
      const inLastCompletedReservation = productVariantsInLastCompletedReservation.includes(
        id
      )
      if (!inLastCompletedReservation) {
        newVariantsBeingReserved.push(id)
        return
      }

      // If it's in the last completed reservation, and they've cancelled 1 or more reservations since then,
      // and it's not in each of those cancelled orders, its new
      const hasCancelledOrdersSinceLastCompletedReservation =
        cancelledReservationssSinceLastCompletedReservation.length > 0
      if (hasCancelledOrdersSinceLastCompletedReservation) {
        const carriedOverItemOnAllCancelledOrders = cancelledReservationssSinceLastCompletedReservation.every(
          a =>
            a.products.flatMap(b => (b.productVariant as any).id).includes(id)
        )
        if (!carriedOverItemOnAllCancelledOrders) {
          newVariantsBeingReserved.push(id)
        }
      }

      // If it's in the last completed reservation, and there are no cancelled reservations since then,
      // and the inventory status of the item is Reservable, it's new (they returned it and are re-reserving right away)
      const isReordering =
        cancelledReservationssSinceLastCompletedReservation.length === 0 &&
        this.reservationUtils.inventoryStatusOf(
          lastCompletedReservation as any,
          id
        ) === "Reservable"
      if (isReordering) {
        newVariantsBeingReserved.push(id)
      }
    })

    if (newVariantsBeingReserved.length === 0) {
      throw new Error(`Must reserve at least 1 new item`)
    }
    return newVariantsBeingReserved
  }

  private async getHeldPhysicalProducts(
    customer: Customer,
    lastCompletedReservation
  ): Promise<PhysicalProduct[]> {
    if (lastCompletedReservation == null) return []

    const reservedBagItems = await this.productUtils.getReservedBagItems(
      customer
    )
    const reservedProductVariantIds = reservedBagItems.map(
      a => a.productVariant.id
    )

    return lastCompletedReservation.products
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
    heldPhysicalProducts: PhysicalProduct[],
    shippingOptionID: string
  ): Promise<ReservationCreateInput> {
    const allPhysicalProductsInReservation = [
      ...physicalProductsBeingReserved,
      ...heldPhysicalProducts,
    ]

    const physicalProductSUIDs = allPhysicalProductsInReservation.map(p => ({
      seasonsUID: p.seasonsUID,
    }))
    const newPhysicalProductSUIDs = physicalProductsBeingReserved.map(p => ({
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

    let createData = {
      products: {
        connect: physicalProductSUIDs,
      },
      newProducts: {
        connect: newPhysicalProductSUIDs,
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
    } as ReservationCreateInput

    if (!!shippingOptionID) {
      createData.shippingOption = { connect: { id: shippingOptionID } }
    }

    return createData
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
    const parentProduct = await this.prisma.client2.product.findFirst({
      where: {
        variants: {
          some: {
            physicalProducts: {
              some: {
                seasonsUID,
              },
            },
          },
        },
      },
    })

    if (parentProduct.status === "Stored") {
      return "Stored"
    }

    return "NonReservable"
  }
}
