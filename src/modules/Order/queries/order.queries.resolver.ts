import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Context, Info, Query, Resolver } from "@nestjs/graphql"
import { addFragmentToInfo } from "graphql-binding"

import { OrderService } from "../services/order.service"

@Resolver()
export class OrderQueriesResolver {
  constructor(private readonly queryUtils: QueryUtilsService) {}

  @Query()
  async order(
    @Args() { where },
    @Select({ withFragment: `fragment EnsureId on Order { id }` }) select
  ) {
    return await this.queryUtils.resolveFindUnique({ where, select }, "Order")
  }

  @Query()
  async orders(
    @FindManyArgs({ withFragment: `fragment EnsureId on Order { id }` }) args
  ) {
    return this.queryUtils.resolveFindMany(args, "Order")
  }

  @Query()
  async ordersConnection(@Args() args) {
    return this.queryUtils.resolveConnection(args, "Order")
  }
}
