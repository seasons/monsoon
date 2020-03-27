import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { PrismaService } from "../../../prisma/prisma.service"

@Resolver()
export class CollectionGroupQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async collectionGroup(@Args() args, @Info() info) {
    return await this.prisma.binding.query.collectionGroup(args, info)
  }

  @Query()
  async collectionGroups(@Args() args, @Info() info) {
    return await this.prisma.binding.query.collectionGroups(args, info)
  }
}
