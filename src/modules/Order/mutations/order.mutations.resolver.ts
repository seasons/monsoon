import { Customer, User } from "@app/decorators"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { BadRequestException } from "@nestjs/common"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { pick } from "lodash"

import { OrderService } from "../services/order.service"

@Resolver("Order")
export class OrderMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly order: OrderService,
    private readonly segment: SegmentService
  ) {}

  @Mutation()
  async createDraftedOrder(
    @Args() { input: { orderType, productVariantID } },
    @Customer() customer,
    @User() user,
    @Info() info
  ) {
    try {
      let draftOrder
      if (orderType === "New") {
        draftOrder = await this.order.buyNewCreateDraftedOrder({
          productVariantID,
          customer,
        })
      } else {
        draftOrder = await this.order.buyUsedCreateDraftedOrder({
          productVariantID,
          customer,
          user,
          info,
        })
      }

      this.segment.track(user.id, "Created Draft Order", {
        orderType,
        productVariantID,
        orderID: draftOrder.id,
        ...pick(user, ["firstName", "lastName", "email"]),
      })
      return draftOrder
    } catch (e) {
      console.error(e)
      throw new BadRequestException()
    }
  }

  @Mutation()
  async submitOrder(
    @Args() { input: { orderID } },
    @Customer() customer,
    @User() user,
    @Info() info
  ) {
    try {
      const order = await this.prisma.client.order({ id: orderID })
      let submittedOrder
      if (order.type === "New") {
        submittedOrder = await this.order.buyNewSubmitOrder({
          order,
          customer,
        })
      } else {
        submittedOrder = await this.order.buyUsedSubmitOrder({
          order,
          customer,
          user,
          info,
        })
      }

      this.segment.track(user.id, "Submitted Order", {
        orderID,
        ...pick(user, ["firstName", "lastName", "email"]),
      })

      return submittedOrder
    } catch (e) {
      console.error(e)
      throw new BadRequestException()
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
