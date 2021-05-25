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
  async blogPost(@Args() { where }, @Select({}) select) {
    const data = await this.prisma.client2.blogPost.findUnique({
      where,
      ...select,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, "BlogPost")
    return sanitizedData
  }

  @Query()
  async blogPosts(@FindManyArgs({}) { orderBy, ...args }, @Select({}) select) {
    const data = await this.prisma.client2.blogPost.findMany({
      ...args,
      orderBy: orderBy || { webflowCreatedAt: "desc" },
      ...select,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, "BlogPost")

    return sanitizedData
  }

  @Query()
  async blogPostsConnection(
    @Args() args,
    @FindManyArgs({}) { where, orderBy },
    @Select({}) select
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
