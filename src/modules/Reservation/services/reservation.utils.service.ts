import { ShippingService } from "@app/modules/Shipping/services/shipping.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Package, PrismaPromise, Reservation } from "@prisma/client"
import { head } from "lodash"

import { ReservationWithProductVariantData } from "./reservation.service"

interface InitialState {
  Lost?: number
  ReturnProcessed?: number
  DeliveredToCustomer?: number
}

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

  async updateReturnPackageOnCompletedReservation(
    prismaReservation: any,
    returnedPhysicalProducts: any[], // fields specified in getPrismaReservationWithNeededFields
    trackingNumber: string
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

    let packageToUpdate = prismaReservation.returnPackages.find(
      a => a.shippingLabel.trackingNumber === trackingNumber
    )
    if (!packageToUpdate) {
      throw new Error(
        `No return package found with tracking number: ${trackingNumber}`
      )
    }
    return [
      this.prisma.client.package.update({
        data: {
          items: { connect: returnedPhysicalProductIDs },
          weight,
        },
        where: { id: packageToUpdate.id },
      }),
    ]
  }

  async updateReservationOnChange(
    reservationIds: string[],
    initialState: InitialState,
    resPhysProdsIds: string[]
  ) {
    const reservations = await this.prisma.client.reservation.findMany({
      where: {
        id: {
          in: reservationIds,
        },
      },
      select: {
        id: true,
        reservationPhysicalProducts: {
          where: {
            id: {
              notIn: resPhysProdsIds,
            },
          },
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    const promises = []

    for (const reservation of reservations) {
      const reservationPhysProds = reservation.reservationPhysicalProducts
      const resPhysProdStatusCounts = { ...initialState }

      for (const resPhysProd of reservationPhysProds) {
        const status = resPhysProd.status

        if (
          !["Lost", "ReturnProcessed", "DeliveredToCustomer"].includes(status)
        ) {
          continue
        }

        if (resPhysProdStatusCounts[status]) {
          resPhysProdStatusCounts[status] += 1
          continue
        }

        resPhysProdStatusCounts[status] = 1
      }

      let statusWithMaxCount = {
        status: "Lost",
        count: resPhysProdStatusCounts["Lost"],
      }
      delete resPhysProdStatusCounts["Lost"]
      for (const [status, count] of Object.entries(resPhysProdStatusCounts)) {
        if (count > statusWithMaxCount["count"]) {
          statusWithMaxCount.status = status
          statusWithMaxCount.count = count
        }
      }

      const maxStatus = statusWithMaxCount.status
      const newReservationStatus =
        maxStatus === "Lost"
          ? "Lost"
          : maxStatus === "ReturnProcessed"
          ? "Completed"
          : maxStatus === "DeliveredToCustomer"
          ? "Delivered"
          : null
      if (newReservationStatus === null) {
        throw new Error("")
      }
      promises.push(
        this.prisma.client.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: newReservationStatus,
          },
        })
      )
    }
    return promises
  }
}
