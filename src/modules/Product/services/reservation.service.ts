import * as Sentry from "@sentry/node"

import {
  Customer,
  ID_Input,
  PhysicalProduct,
  Reservation,
  ReservationCreateInput,
  ReservationStatus,
  User,
} from "@prisma/index"

import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { ApolloError } from "apollo-server"
import { EmailService } from "@modules/Email/services/email.service"
import { Injectable } from "@nestjs/common"
import { PhysicalProductService } from "./physicalProduct.utils.service"
import { PrismaService } from "@prisma/prisma.service"
import { ProductUtilsService } from "./product.utils.service"
import { ProductVariantService } from "./productVariant.service"
import { ReservationUtilsService } from "./reservation.utils.service"
import { RollbackError } from "@app/errors"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { ShippoTransaction } from "@modules/Shipping/shipping.types"
import { head } from "lodash"

interface PhysicalProductWithProductVariant extends PhysicalProduct {
  productVariant: { id: ID_Input }
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
    private readonly physicalProductService: PhysicalProductService,
    private readonly airtableService: AirtableService,
    private readonly shippingService: ShippingService,
    private readonly emails: EmailService,
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
      const lastReservation = await this.getLatestReservation(customer)
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
      const rollbackPrismaPhysicalProductStatuses = await this.physicalProductService.markPhysicalProductsReservedOnPrisma(
        physicalProductsBeingReserved
      )
      rollbackFuncs.push(rollbackPrismaPhysicalProductStatuses)
      const rollbackAirtablePhysicalProductStatuses = await this.airtableService.markPhysicalProductsReservedOnAirtable(
        physicalProductsBeingReserved
      )
      rollbackFuncs.push(rollbackAirtablePhysicalProductStatuses)

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
        info
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

  private async getLatestReservation(
    customer: Customer
  ): Promise<ReservationWithProductVariantData | null> {
    return new Promise(async (resolve, reject) => {
      const allCustomerReservationsOrderedByCreatedAt = await this.prisma.client
        .customer({ id: customer.id })
        .reservations({
          orderBy: "createdAt_DESC",
        })

      const latestReservation = head(
        allCustomerReservationsOrderedByCreatedAt
      ) as Reservation
      if (latestReservation == null) {
        return resolve(null)
      } else {
        const res = (await this.prisma.binding.query.reservation(
          {
            where: { id: latestReservation.id },
          },
          `{ 
                id  
                products {
                    id
                    seasonsUID
                    inventoryStatus
                    productStatus
                    productVariant {
                        id
                    }
                }
                status
                reservationNumber
             }`
        )) as ReservationWithProductVariantData
        return resolve(res)
      }
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
    productVariantIds: Array<ID_Input>
  ): Promise<() => void> {
    // Update the bag items
    const bagItemsToUpdate = await this.prisma.client.bagItems({
      where: {
        customer: {
          id: customerId,
        },
        productVariant: {
          id_in: productVariantIds,
        },
        status: "Added",
      },
    })
    const bagItemsToUpdateIds = bagItemsToUpdate.map(a => a.id)
    await this.prisma.client.updateManyBagItems({
      where: { id_in: bagItemsToUpdateIds },
      data: {
        status: "Reserved",
      },
    })

    // Create and return a rollback function
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
    const uniqueReservationNumber = await this.getUniqueReservationNumber()

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
      sentPackage: {
        create: {
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
      location: {
        connect: {
          slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
        },
      },
      shipped: false,
      status: "InQueue",
    }
  }

  private async getUniqueReservationNumber(): Promise<number> {
    let reservationNumber: number
    let foundUnique = false
    while (!foundUnique) {
      reservationNumber = Math.floor(Math.random() * 900000000) + 100000000
      const reservationWithThatNumber = await this.prisma.client.reservation({
        reservationNumber,
      })
      foundUnique = !reservationWithThatNumber
    }

    return reservationNumber
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
}
