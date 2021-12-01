import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"

interface InitialState {
  Lost?: number
  ReturnProcessed?: number
  DeliveredToCustomer?: number
}

@Injectable()
export class ReservationUtilsService {
  constructor(private readonly prisma: PrismaService) {}

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
        status: true,
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
