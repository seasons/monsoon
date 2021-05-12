import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"

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
  async blogPostsConnection(@Args() { skip, count, ...args }, @Info() info) {
    return this.prisma.binding.query.blogPostsConnection(
      {
        orderBy: "webflowCreatedAt_DESC",
        skip,
        first: count,
        ...args,
      },
      info
    )
  }
}
