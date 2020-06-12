import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { Customer, ID_Input, InventoryStatus, Reservation } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { head } from "lodash"

import { ReservationWithProductVariantData } from "./reservation.service"

@Injectable()
export class ReservationUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService
  ) {}

  inventoryStatusOf = (
    res: ReservationWithProductVariantData,
    prodVarId: ID_Input
  ): InventoryStatus => {
    return res.products.find(prod => prod.productVariant.id === prodVarId)
      .inventoryStatus
  }

  formatReservationReturnDate = (reservationCreatedAtDate: Date) => {
    const date = this.returnDate(reservationCreatedAtDate)
    const display = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    return display
  }

  returnDate = (reservationCreatedAtDate: Date) => {
    const returnDate = new Date(reservationCreatedAtDate)
    returnDate.setDate(reservationCreatedAtDate.getDate() + 30)
    return returnDate
  }

  async getLatestReservation(
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

  async updateUsersBagItemsOnCompletedReservation(
    prismaReservation: any,
    returnedPhysicalProducts: any[] // fields specified in getPrismaReservationWithNeededFields
  ) {
    return await this.prisma.client.deleteManyBagItems({
      customer: { id: prismaReservation.customer.id },
      saved: false,
      productVariant: {
        id_in: returnedPhysicalProducts.map(p => p.productVariant.id),
      },
      status: "Reserved",
    })
  }

  async updateReturnPackageOnCompletedReservation(
    prismaReservation: any,
    returnedPhysicalProducts: any[] // fields specified in getPrismaReservationWithNeededFields
  ) {
    const returnedPhysicalProductIDs: {
      id: ID_Input
    }[] = returnedPhysicalProducts.map(p => {
      return { id: p.id }
    })
    const returnedProductVariantIDs: string[] = prismaReservation.products
      .filter(p => p.inventoryStatus === "Reservable")
      .map(prod => prod.productVariant.id)
    const weight = await this.shippingService.calcShipmentWeightFromProductVariantIDs(
      returnedProductVariantIDs
    )

    if (prismaReservation.returnedPackage != null) {
      await this.prisma.client.updatePackage({
        data: {
          items: { connect: returnedPhysicalProductIDs },
          weight,
        },
        where: { id: prismaReservation.returnedPackage.id },
      })
    } else {
      await this.prisma.client.updateReservation({
        data: {
          returnedPackage: {
            create: {
              items: { connect: returnedPhysicalProductIDs },
              weight,
              shippingLabel: {
                create: {},
              },
              fromAddress: {
                connect: {
                  slug: prismaReservation.customer.detail.shippingAddress.slug,
                },
              },
              toAddress: {
                connect: {
                  slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
                },
              },
            },
          },
        },
        where: {
          id: prismaReservation.id,
        },
      })
    }
  }

  async getUniqueReservationNumber(): Promise<number> {
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
}
