import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma1/prisma.service"
import { head } from "lodash"

@Injectable()
export class CustomerUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async nextFreeSwapDate(customerID: string): Promise<string> {
    const customer = await this.prisma.client.customer.findUnique({
      where: { id: customerID },
      select: {
        reservations: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            status: true,
            products: {
              select: {
                id: true,
              },
            },
            createdAt: true,
          },
          where: {
            status: {
              not: {
                in: ["Lost", "Cancelled"],
              },
            },
          },
        },
        membership: {
          select: {
            plan: {
              select: {
                itemCount: true,
                tier: true,
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
    const latestReservation = head(customer.reservations)
    const customerPlan = customer?.membership?.plan
    const customerPlanTier = customerPlan?.tier
    const latestReservationCreatedAt = latestReservation?.createdAt?.toISOString()
    const currentTermEnd = customer?.membership?.subscription?.currentTermEnd?.toISOString()
    const currentTermStart = customer?.membership?.subscription?.currentTermStart?.toISOString()
    const customerOnEssentialPlan = customerPlanTier === "Essential"

    if (
      !currentTermEnd ||
      !currentTermStart ||
      !latestReservationCreatedAt ||
      !customerOnEssentialPlan
    ) {
      return null
    }

    const hasAvailableSwap =
      latestReservationCreatedAt &&
      currentTermStart &&
      latestReservationCreatedAt < currentTermStart

    if (hasAvailableSwap) {
      return currentTermStart
    } else {
      return currentTermEnd
    }
  }
}
