import { Args, Info, Parent, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { addFragmentToInfo } from "graphql-binding"

@Resolver()
export class BrandQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async brand(@Args() args, @Info() info) {
    if (typeof args?.published === "boolean") {
      const brand = await this.prisma.binding.query.brand(
        args,
        addFragmentToInfo(
          info,
          `fragment EnsurePublished on Brand { published }`
        )
      )
      return args.published === brand.published ? brand : null
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
