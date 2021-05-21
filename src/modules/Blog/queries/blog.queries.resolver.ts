import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { PrismaService } from "@app/prisma/prisma.service"
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { isEmpty } from "lodash"

@Resolver()
export class BlogQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async blogPost(@Args() args, @Info() info) {
    return this.prisma.binding.query.blogPost(args, info)
  }

  @Query()
  async blogPosts(@Args() { skip, count, ...args }, @Info() info) {
    return this.prisma.binding.query.blogPosts(
      {
        orderBy: "webflowCreatedAt_DESC",
        skip,
        first: count,
        ...args,
      },
      info
    )
  }

  @Query()
  async blogPostsConnection(
    @Args() args,
    @FindManyArgs() { where, orderBy },
    @Select() select
  ) {
    const result = await findManyCursorConnection(
      args =>
        this.prisma.client2.blogPost.findMany({
          ...args,
          ...select,
          where,
          orderBy: isEmpty(orderBy) ? { webflowCreatedAt: "desc" } : orderBy,
        }),
      () => this.prisma.client2.blogPost.count({ where }),
      { ...args } // typeof ConnectionArguments
    )
    const sanitizedResult = this.prisma.sanitizeConnection(result)
    return sanitizedResult
  }
}
