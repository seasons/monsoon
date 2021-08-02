import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Package, PrismaPromise, Reservation } from "@prisma/client"

import { ReservationWithProductVariantData } from "./reservation.service"

@Injectable()
export class ReservationUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService
  ) {}

  inventoryStatusOf = (
    res: ReservationWithProductVariantData,
    prodVarId: string
  ) => {
    return res.products.find(prod => prod.productVariant.id === prodVarId)
      .inventoryStatus
  }

  async getLatestReservation(customerID: string, status = undefined) {
    const latestReservation = await this.prisma.client.reservation.findFirst({
      where: {
        customer: {
          id: customerID,
        },
        status,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        products: {
          select: {
            id: true,
            seasonsUID: true,
            inventoryStatus: true,
            productStatus: true,
            productVariant: { select: { id: true } },
          },
        },
        receivedAt: true,
        status: true,
        reservationNumber: true,
        createdAt: true,
      },
    })

    if (latestReservation == null) {
      return null
    }

    return latestReservation
  }

  async updateReturnPackageOnCompletedReservation(
    prismaReservation: any,
    returnedPhysicalProducts: any[] // fields specified in getPrismaReservationWithNeededFields
  ): Promise<[PrismaPromise<Package> | PrismaPromise<Reservation>]> {
    const returnedPhysicalProductIDs: {
      id: string
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
      return [
        this.prisma.client.package.update({
          data: {
            items: { connect: returnedPhysicalProductIDs },
            weight,
          },
          where: { id: prismaReservation.returnedPackage.id },
        }),
      ]
    } else {
      return [
        (this.prisma.client.reservation.update({
          data: {
            returnedPackage: {
              update: {
                items: { connect: returnedPhysicalProductIDs },
                weight,
                shippingLabel: {
                  create: {},
                },
                fromAddress: {
                  connect: {
                    slug:
                      prismaReservation.customer.detail.shippingAddress.slug,
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
        }) as unknown) as PrismaPromise<Reservation>,
      ]
    }
  }

  async getUniqueReservationNumber(): Promise<number> {
    let reservationNumber: number
    let foundUnique = false
    while (!foundUnique) {
      reservationNumber = Math.floor(Math.random() * 900000000) + 100000000
      const reservationWithThatNumber = await this.prisma.client.reservation.findUnique(
        {
          where: {
            reservationNumber,
          },
        }
      )
      foundUnique = !reservationWithThatNumber
    }

    return reservationNumber
  }
}
