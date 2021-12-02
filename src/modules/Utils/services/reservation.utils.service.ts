import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"

@Injectable()
export class ReservationUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateReservationOnChange(
    reservationIds: string[],
    /**
     * should ba an object that has the rpp ids as keys and the statuses they will be changed to as the values
     * example: {"afiaowefiuwhf": "Lost", "asdfasdfasdf": "Lost"}
     * */
    rppStatusesAfterChange: any
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
      const resPhysProdStatusCounts = {
        Lost: 0,
        ReturnProcessed: 0,
        DeliveredToCustomer: 0,
      }

      for (const resPhysProd of reservationPhysProds) {
        const status = resPhysProd.status
        const rppStatusAfterChange = rppStatusesAfterChange[resPhysProd.id]

        if (rppStatusAfterChange) {
          resPhysProdStatusCounts[rppStatusAfterChange] += 1
          continue
        }

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
}
