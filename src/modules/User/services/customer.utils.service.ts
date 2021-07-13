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
            plan: {
              select: {
                planID: true,
              },
            },
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
    const essentialPlanIDs = [
      "essential-6",
      "essential",
      "essential-2",
      "essential-1",
    ]
    const customer = this.prisma.sanitizePayload(_customer, "Customer")
    const latestReservation = head(customer.reservations)
    const customerPlanID = customer?.membership?.plan?.planID
    const latestReservationCreatedAt = latestReservation?.createdAt?.toISOString()
    const currentTermEnd = customer?.membership?.subscription?.currentTermEnd?.toISOString()
    const currentTermStart = customer?.membership?.subscription?.currentTermStart?.toISOString()
    const customerOnEssentialPlan = essentialPlanIDs.includes(customerPlanID)

    if (
      !currentTermEnd ||
      !currentTermStart ||
      !latestReservationCreatedAt ||
      !customerOnEssentialPlan
    ) {
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
