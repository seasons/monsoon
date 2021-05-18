import { Select } from "@app/decorators/select.decorator"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
import { ApolloError } from "apollo-server"
import { addFragmentToInfo } from "graphql-binding"

@Resolver()
export class BrandQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async brand(@Args() args, @Info() info, @Select() select) {
    if (typeof args?.published === "boolean") {
      const brand: any = await this.prisma.client2.brand.findFirst({
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
    } else {
      return await this.prisma.binding.query.brand(args, info)
    }
  }

  @Query()
  async brands(@Args() args, @Info() info) {
    return this.prisma.binding.query.brands(args, info)
  }

  @Query()
  async brandsConnection(@Args() args, @Info() info) {
    return this.prisma.binding.query.brandsConnection(args, info)
  }
}
