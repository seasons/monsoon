import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Context, Info, Query, Resolver } from "@nestjs/graphql"
import { addFragmentToInfo } from "graphql-binding"

import { OrderService } from "../services/order.service"

@Resolver()
export class OrderQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderService: OrderService
  ) {}

  @Query()
  async order(@Args() args, @Info() info, @Context() ctx) {
    return await this.prisma.binding.query.order(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on Order { id }`
      )
    )
  }

  @Query()
  async orders(@Args() args, @Info() info) {
    return await this.prisma.binding.query.orders(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on Order { id }`
      )
    )
  }

  @Query()
  async ordersConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.ordersConnection(args, info)
  }
}
