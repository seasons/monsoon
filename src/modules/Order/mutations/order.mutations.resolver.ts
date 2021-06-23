import { Customer, User } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { BadRequestException } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
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
    @Select() select
  ) {
    try {
      let draftOrder
      if (orderType === "New") {
        draftOrder = await this.order.buyNewCreateDraftedOrder({
          productVariantID,
          customer,
          user,
          select,
        })
      } else {
        draftOrder = await this.order.buyUsedCreateDraftedOrder({
          productVariantID,
          customer,
          user,
          select,
        })
      }

      this.segment.track(user.id, "Created Draft Order", {
        orderType,
        productVariantID,
        orderID: draftOrder.id,
        total: draftOrder.total,
        ...pick(user, ["firstName", "lastName", "email", "id"]),
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
    @Select() select
  ) {
    try {
      const order = await this.prisma.client2.order.findUnique({
        where: { id: orderID },
      })
      let submittedOrder
      if (order.type === "New") {
        submittedOrder = await this.order.buyNewSubmitOrder({
          order,
          customer,
          user,
          select,
        })
      } else {
        submittedOrder = await this.order.buyUsedSubmitOrder({
          order,
          customer,
          user,
          select,
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
  updateOrderStatus(
    @Args() { orderID, status },
    @Customer() customer,
    @Select() select
  ) {
    return this.order.updateOrderStatus({ orderID, status, customer, select })
  }
}
