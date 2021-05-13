import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { addFragmentToInfo } from "graphql-binding"

@Resolver()
export class CollectionQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async collection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.collection(args, info)
  }

  @Query()
  async collections(@Args() args, @Info() info) {
    if (args?.placements?.length > 0) {
      const collections = await this.prisma.binding.query.collections(
        args,
        addFragmentToInfo(
          info,
          `fragment EnsurePlacements on Collection { placements }`
        )
      )
      return collections.filter(collection => {
        return collection?.placements?.some(p => args?.placements.includes(p))
      })
    } else {
      return await this.prisma.binding.query.collections(args, info)
    }
  }

  @Query()
  async collectionsConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.collectionsConnection(args, info)
  }
}
