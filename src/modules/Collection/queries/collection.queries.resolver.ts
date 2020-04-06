import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class CollectionQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async collections(@Args() args, @Info() info) {
    return await this.prisma.binding.query.collections(args, info)
  }

  @Query()
  async collection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.collection(args, info)
  }
}
