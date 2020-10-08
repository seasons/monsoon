import { Args, Info, Parent, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class BrandQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async brand(@Args() args, @Info() info) {
    return await this.prisma.binding.query.brand(args, info)
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
