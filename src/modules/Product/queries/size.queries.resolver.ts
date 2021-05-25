import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

@Resolver()
export class SizeQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  @Query()
  async bottomSize(@Args() { where }, @Select({}) select) {
    return this.queryUtils.resolveFindUnique(where, select, "BottomSize")
  }

  @Query()
  async bottomSizes(@FindManyArgs({}) args, @Select({}) select) {
    return this.queryUtils.resolveFindMany(args, select, "BottomSize")
  }

  @Query()
  async topSize(@Args() { where }, @Select({}) select) {
    return this.queryUtils.resolveFindUnique(where, select, "TopSize")
  }

  @Query()
  async topSizes(@FindManyArgs({}) args, @Select({}) select) {
    return this.queryUtils.resolveFindMany(args, select, "TopSize")
  }

  @Query()
  async size(@Args() { where }, @Select({}) select) {
    return this.queryUtils.resolveFindUnique(where, select, "Size")
  }

  @Query()
  async sizes(@FindManyArgs({}) args, @Select({}) select) {
    return this.queryUtils.resolveFindMany(args, select, "Size")
  }

  @Query()
  async sizesConnection(@Args() args, @Select({}) select) {
    return this.queryUtils.resolveConnection(args, select, "Size")
  }
}
