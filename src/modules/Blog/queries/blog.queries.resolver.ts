import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { Args, Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class BlogQueriesResolver {
  constructor(private readonly queryUtils: QueryUtilsService) {}

  @Query()
  async blogPost(@Args() { where }, @Select() select) {
    return this.queryUtils.resolveFindUnique({ where, select }, "BlogPost")
  }

  @Query()
  async blogPosts(@FindManyArgs({}) { orderBy, ...args }, @Select() select) {
    return this.queryUtils.resolveFindMany(
      {
        ...args,
        orderBy: orderBy || { webflowCreatedAt: "desc" },
        select,
      },
      "BlogPost"
    )
  }

  @Query()
  async blogPostsConnection(@Args() args, @Select() select) {
    return this.queryUtils.resolveConnection({ ...args, select }, "BlogPost")
  }
}
