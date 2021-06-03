import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

@Resolver()
export class CollectionQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  @Query()
  async collection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.collection(args, info)
  }

  @Query()
  async collections(
    @FindManyArgs({
      withFragment: args =>
        args?.placements?.length > 0
          ? `fragment EnsurePlacements on Collection { placements }`
          : "fragment DefaultFragment on Collection { id }",
    })
    args
  ) {
    const collections = await this.queryUtils.resolveFindMany<any>(
      args,
      "Collection"
    )
    if (args?.placements?.length > 0) {
      return collections.filter(collection => {
        return collection?.placements?.some(p => args?.placements.includes(p))
      })
    } else {
      return collections
    }
  }

  @Query()
  async collectionsConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.collectionsConnection(args, info)
  }
}
