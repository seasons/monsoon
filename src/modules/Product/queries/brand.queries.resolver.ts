import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"

@Resolver()
export class BrandQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  @Query()
  async brand(
    @Args() args,
    @Select({
      withFragment: `fragment EnsureSlug on Brand { slug }`,
    })
    select
  ) {
    let data
    if (typeof args?.published === "boolean") {
      const brand: any = await this.prisma.client.brand.findUnique({
        select: {
          ...select,
          published: true,
        },
        where: { ...args.where },
      })

      if (args?.published === brand?.published) {
        data = brand
      } else {
        throw new ApolloError("Brand not found", "404")
      }
    }

    if (!data) {
      data = await this.prisma.client.brand.findUnique({
        ...args,
        select,
      })
    }

    return data
  }

  @Query()
  async brands(
    @FindManyArgs({ withFragment: `fragment EnsureSlug on Brand { slug }` })
    args
  ) {
    return this.queryUtils.resolveFindMany(args, "Brand")
  }

  @Query()
  async brandsConnection(@Args() args, @Select() select) {
    return this.queryUtils.resolveConnection({ ...args, select }, "Brand")
  }
}
