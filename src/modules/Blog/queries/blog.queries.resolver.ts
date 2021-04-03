import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class BlogQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async blogPosts(@Args() { skip, count }, @Info() info) {
    return this.prisma.binding.query.blogPosts(
      {
        orderBy: "webflowCreatedAt_DESC",
        skip,
        first: count,
      },
      info
    )
  }
}
