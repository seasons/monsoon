import { Customer } from "@app/decorators"
import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { PrismaService } from "@app/prisma/prisma.service"
import { Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class ShippingQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async shippingMethods(@Customer() customer, @FindManyArgs() args) {
    const customerWithState = await this.prisma.client.customer.findFirst({
      where: { id: customer.id },
      select: {
        id: true,
        detail: {
          select: {
            shippingAddress: {
              select: {
                state: true,
              },
            },
          },
        },
      },
    })

    const state = customerWithState?.detail?.shippingAddress?.state
    const customerIsInNewYork = state === "NY"
    const customerIsOnWestCoast = ["CA", "OR", "WA"].includes(state)

    const includeMethods = ["UPSGround"]
    if (customerIsInNewYork) {
      includeMethods.push("Pickup")
    } else if (customerIsOnWestCoast) {
      includeMethods.push("UPSSelect")
    }

    const data = await this.prisma.client.shippingMethod.findMany({
      ...args,
      where: {
        code: {
          in: includeMethods,
        },
      },
      orderBy: {
        position: "asc",
      },
    })

    return data
  }
}
