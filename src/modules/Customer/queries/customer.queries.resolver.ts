import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { addFragmentToInfo } from "graphql-binding"

@Resolver()
export class CustomerQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  @Query()
  async customer(@Args() args, @Info() info) {
    return await this.prisma.binding.query.customer(
      args,
      addFragmentToInfo(info, `fragment EnsureId on Customer {id}`)
    )
  }

  @Query()
  async customers(@Args() args, @Info() info) {
    return await this.prisma.binding.query.customers(
      args,
      addFragmentToInfo(info, `fragment EnsureId on Customer {id}`)
    )
  }

  @Query()
  async customersConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.customersConnection(args, info)
  }

  @Query()
  async pauseReason(@Args() { where }, @Select() select) {
    return await this.queryUtils.resolveFindUnique(
      { where, select },
      "PauseReason"
    )
  }

  @Query()
  async pauseReasons(@Args() args) {
    return await this.queryUtils.resolveFindMany(args, "PauseReason")
  }
}
