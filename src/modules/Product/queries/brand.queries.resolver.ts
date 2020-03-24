import { Resolver, Args, Query, Info } from "@nestjs/graphql"
import { PrismaService } from "../../../prisma/prisma.service"

@Resolver()
export class BrandQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async brand(@Args() args, @Info() info) {
    return await this.prisma.binding.query.brand(args, info)
  }

  @Query()
  async brands(@Args() args, @Info() info) {
    const brands = await this.prisma.binding.query.brands(args, info)
    const brandsWithProducts = brands.filter(brand => {
      return brand?.products?.length > 0
    })
    return brandsWithProducts
  }
}
