import { ReservationPhysicalProductService } from "@app/modules/Reservation"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"

import { ReservationPhysicalProductStatus } from ".prisma/client"

export type RPPStatusCounts = {
  [key: string]: ReservationPhysicalProductStatus
}

@Injectable()
export class ReservationUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateReservationOnChange(
    reservationIds: string[],
    rppStatusesAfterChange: RPPStatusCounts
  ) {
    const reservations = await this.prisma.client.reservation.findMany({
      where: {
        id: {
          in: reservationIds,
        },
      },
      select: {
        id: true,
        status: true,
        reservationPhysicalProducts: {
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
      const resPhysProdStatusCounts = {} as {
        [key in ReservationPhysicalProductStatus]: number
      }

      for (const resPhysProd of reservationPhysProds) {
        const status = this.getEffectiveStatus(resPhysProd.status)
        const rppStatusAfterChange = this.getEffectiveStatus(
          rppStatusesAfterChange[resPhysProd.id]
        )

        if (rppStatusAfterChange) {
          resPhysProdStatusCounts[rppStatusAfterChange] =
            (resPhysProdStatusCounts[rppStatusAfterChange] || 0) + 1
          continue
        }

        if (
          !["Lost", "ReturnProcessed", "DeliveredToCustomer"].includes(status)
        ) {
          continue
        }

        resPhysProdStatusCounts[status] =
          (resPhysProdStatusCounts[status] || 0) + 1
      }

      let statusWithMaxCount = {
        status: "Lost",
        count: resPhysProdStatusCounts["Lost"] || 0,
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
        throw new Error("Unable to determine new reservation status")
      }
      if (newReservationStatus !== reservation.status) {
        promises.push(
          this.prisma.client.reservation.update({
            where: {
              id: reservation.id,
            },
            data: {
              status: newReservationStatus,
              statusUpdatedAt: new Date(),
            },
          })
        )
      }
    }
    return promises
  }

  private getEffectiveStatus(status) {
    return status === "AtHome" ? "DeliveredToCustomer" : status
  }
}
