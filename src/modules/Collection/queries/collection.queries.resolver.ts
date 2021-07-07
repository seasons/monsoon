import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
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
  async collection(
    @Args() args,
    @Select({
      withFragment: `fragment EnsureSlug on Collection { slug }`,
    })
    select
  ) {
    return await this.queryUtils.resolveFindUnique(
      {
        select: {
          ...select,
        },
        where: { ...args.where },
      },
      "Collection"
    )
  }

  @Query()
  async collections(
    @Args() args,
    @FindManyArgs({
      withFragment: args =>
        args?.placements?.length > 0
          ? `fragment EnsurePlacements on Collection { placements }`
          : "fragment DefaultFragment on Collection { id }",
    })
    findManyArgs
  ) {
    const collections = await this.queryUtils.resolveFindMany<any>(
      findManyArgs,
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
  async collectionsConnection(@Args() args, @Select() select) {
    return await this.queryUtils.resolveConnection(
      { ...args, select },
      "Collection"
    )
  }
}
