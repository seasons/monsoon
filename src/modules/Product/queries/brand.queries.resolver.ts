import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"

@Resolver()
export class BrandQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async brand(@Args() args, @Info() info, @Select() select) {
    if (typeof args?.published === "boolean") {
      const brand: any = await this.prisma.client2.brand.findUnique({
        select: {
          ...select.select,
          published: true,
        },
        where: { ...args.where },
      })

      if (args?.published === brand?.published) {
        return brand
      } else {
        throw new ApolloError("Brand not found", "404")
      }
    }

    return await this.prisma.client2.brand.findUnique({
      ...select,
      ...args,
    })
  }

  @Query()
  async brands(@FindManyArgs() args, @Select() select) {
    const data = await this.prisma.client2.brand.findMany({
      ...args,
      ...select,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, "Brand")

    return sanitizedData
  }

  async brandsConnection(@Args() args, @Info() info) {
    return this.prisma.binding.query.brandsConnection(args, info)
  }
}
