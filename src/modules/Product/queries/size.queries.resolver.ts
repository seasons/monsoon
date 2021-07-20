import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { Args, Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class SizeQueriesResolver {
  constructor(private readonly queryUtils: QueryUtilsService) {}

  @Query()
  async bottomSize(@Args() { where }, @Select() select) {
    return this.queryUtils.resolveFindUnique({ where, select }, "BottomSize")
  }

  @Query()
  async bottomSizes(@FindManyArgs() args) {
    return this.queryUtils.resolveFindMany(args, "BottomSize")
  }

  @Query()
  async topSize(@Args() { where }, @Select() select) {
    return this.queryUtils.resolveFindUnique({ where, select }, "TopSize")
  }

  @Query()
  async topSizes(@FindManyArgs() args) {
    return this.queryUtils.resolveFindMany(args, "TopSize")
  }

  @Query()
  async size(@Args() { where }, @Select() select) {
    return this.queryUtils.resolveFindUnique({ where, select }, "Size")
  }

  @Query()
  async sizes(@FindManyArgs() args) {
    return this.queryUtils.resolveFindMany(args, "Size")
  }

  @Query()
  async sizesConnection(@Args() args, @Select() select) {
    return this.queryUtils.resolveConnection({ ...args, select }, "Size")
  }
}
