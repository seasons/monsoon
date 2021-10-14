import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma1/prisma.service"
import got from "got"
import { head } from "lodash"

@Injectable()
export class CustomerUtilsService {
  private latestIOSAppVersion

  constructor(private readonly prisma: PrismaService) {
    // Cache latest ios app version
    try {
      const authenticatedURL = `https://${process.env.GITHUB_ACCESS_TOKEN}@raw.githubusercontent.com/seasons/harvest/production/package.json`
      const response = got(authenticatedURL).then(response => {
        const packageJSON = JSON.parse(response.body)
        this.latestIOSAppVersion = packageJSON["version"]
      })
    } catch (err) {
      // noop
    }
  }

  getMaxIOSAppVersion() {
    return this.latestIOSAppVersion
  }

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
    const latestReservationCreatedAt = latestReservation?.createdAt?.toISOString()
    const currentTermEnd = customer?.membership?.subscription?.currentTermEnd?.toISOString()
    const currentTermStart = customer?.membership?.subscription?.currentTermStart?.toISOString()

    if (!currentTermEnd || !currentTermStart || !latestReservationCreatedAt) {
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
