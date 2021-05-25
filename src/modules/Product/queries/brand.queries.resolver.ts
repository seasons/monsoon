import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"

@Resolver()
export class BrandQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  @Query()
  async brand(@Args() args, @Select({}) select) {
    let data
    if (typeof args?.published === "boolean") {
      const brand: any = await this.prisma.client2.brand.findUnique({
        select: {
          ...select.select,
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
      data = await this.prisma.client2.brand.findUnique({
        ...select,
        ...args,
      })
    }

    const sanitizedData = this.prisma.sanitizePayload(data, "Brand")

    return sanitizedData
  }

  @Query()
  async brands(@FindManyArgs({}) args, @Select({}) select) {
    return this.queryUtils.resolveFindMany(args, select, "Brand")
  }

  @Query()
  async brandsConnection(@Args() args, @Select({}) select) {
    return this.queryUtils.resolveConnection(args, select, "Brand")
  }
}
