import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma1/prisma.service"
import { head } from "lodash"

@Injectable()
export class CustomerUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async nextFreeSwapDate(customerID: string): Promise<string> {
    const _customer = await this.prisma.client2.customer.findUnique({
      where: { id: customerID },
      select: {
        reservations: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            createdAt: true,
          },
        },
        membership: {
          select: {
            subscription: {
              select: {
                currentTermEnd: true,
                currentTermStart: true,
              },
            },
          },
        },
      },
    })
    const customer = this.prisma.sanitizePayload(_customer, "Customer")
    const latestReservation = head(customer.reservations)

    const latestReservationCreatedAt = latestReservation?.createdAt?.toISOString()
    const currentTermEnd = customer?.membership?.subscription?.currentTermEnd?.toISOString()
    const currentTermStart = customer?.membership?.subscription?.currentTermStart?.toISOString()
    if (!currentTermEnd || !currentTermStart || !latestReservationCreatedAt) {
      return null
    }

    const reservationCreatedBeforeTermStart =
      latestReservationCreatedAt &&
      currentTermStart &&
      latestReservationCreatedAt < currentTermStart
    const hasAvailableSwap = reservationCreatedBeforeTermStart

    if (hasAvailableSwap) {
      return currentTermStart
    } else {
      return currentTermEnd
    }
  }
}
