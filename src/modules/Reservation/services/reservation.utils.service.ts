import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { Customer, ID_Input, InventoryStatus, Reservation } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { head } from "lodash"

import { ReservationWithProductVariantData } from "./reservation.service"
import { Prisma } from ".prisma/client"

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

  async getLatestReservation(customer: Customer, status = undefined) {
    const _latestReservation = await this.prisma.client2.reservation.findFirst({
      where: {
        customer: {
          id: customer.id,
        },
        status,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: Prisma.validator<Prisma.ReservationSelect>()({
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
      }),
    })

    if (_latestReservation == null) {
      return null
    }

    const latestReservation = this.prisma.sanitizePayload(
      _latestReservation,
      "Reservation"
    )
    return latestReservation
  }

  async updateUsersBagItemsOnCompletedReservation(
    prismaReservation: any,
    returnedPhysicalProducts: any[] // fields specified in getPrismaReservationWithNeededFields
  ) {
    return await this.prisma.client2.bagItem.deleteMany({
      where: {
        customer: prismaReservation.customer.id,
        saved: false,
        productVariant: {
          id: {
            in: returnedPhysicalProducts.map(p => p.productVariant.id),
          },
        },
        status: "Reserved",
      },
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
            update: {
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
