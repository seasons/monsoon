import { Customer, User } from "@app/decorators"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

import { OrderService } from "../services/order.service"

@Resolver("Order")
export class OrderMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly order: OrderService
  ) {}

  @Mutation()
  async createDraftedOrder(
    @Args() { input: { orderType, productVariantId } },
    @Customer() customer,
    @User() user,
    @Info() info
  ) {
    if (orderType === "New") {
      return this.order.buyNewCreateDraftedOrder({
        productVariantId,
        customer,
      })
    } else {
      const draftOrder = await this.order.buyUsedCreateDraftedOrder({
        productVariantId,
        customer,
        user,
        info,
      })
      return draftOrder
    }
  }

  @Mutation()
  async submitOrder(
    @Args() { input: { orderID } },
    @Customer() customer,
    @User() user,
    @Info() info
  ) {
    const order = await this.prisma.client.order({ id: orderID })

    if (order.type === "New") {
      return this.order.buyNewSubmitOrder({
        order,
        customer,
      })
    } else {
      return this.order.buyUsedSubmitOrder({
        order,
        customer,
        user,
        info,
      })
    }
  }

  @Mutation()
  async updateOrderStatus(@Args() { orderID, status }) {
    return await this.prisma.client.updateOrder({
      where: { id: orderID },
      data: {
        status,
      },
    })
  }
}
