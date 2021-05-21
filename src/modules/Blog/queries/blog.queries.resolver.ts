import { sanitizeWhere } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { PrismaService } from "@app/prisma/prisma.service"
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import {
  makeOrderByPrisma2Compatible,
  makeWherePrisma2Compatible,
} from "@prisma/binding-argument-transform"

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
  async blogPostsConnection(@Args() args, @Select() select) {
    const prisma2Where = makeWherePrisma2Compatible(args.where)
    const sanitizedPrisma2Where = sanitizeWhere(prisma2Where, "BlogPost")
    const prisma2OrderBy = makeOrderByPrisma2Compatible(args.orderBy)

    const result = await findManyCursorConnection(
      args =>
        this.prisma.client2.blogPost.findMany({
          ...args,
          ...select,
          where: sanitizedPrisma2Where,
          orderBy: { webflowCreatedAt: "desc", ...prisma2OrderBy },
        }),
      () =>
        this.prisma.client2.blogPost.count({ where: sanitizedPrisma2Where }),
      { ...args } // typeof ConnectionArguments
    )
    return { ...result, aggregate: { count: result.totalCount } }
  }
}
