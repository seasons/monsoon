import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"

@Resolver()
export class BrandQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async brand(@Args() args, @Select() select) {
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
  async brands(@FindManyArgs({}) args, @Select() select) {
    const data = await this.prisma.client2.brand.findMany({
      ...args,
      ...select,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, "Brand")

    return sanitizedData
  }

  @Query()
  async brandsConnection(
    @Args() args,
    @FindManyArgs({}) { where, orderBy },
    @Select() select
  ) {
    // TODO: Need to sanitize the edges
    const result = await findManyCursorConnection(
      args =>
        this.prisma.client2.brand.findMany({
          ...args,
          ...select,
          where,
          orderBy,
        }),
      () => this.prisma.client2.brand.count({ where }),
      { ...args }
    )
    const sanitizedResult = this.prisma.sanitizeConnection(result)
    return sanitizedResult
  }
}
