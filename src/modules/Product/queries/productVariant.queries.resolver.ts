import { Resolver, Args, Query, Info } from "@nestjs/graphql"
import { PrismaService } from "../../../prisma/prisma.service"

@Resolver()
export class ProductVariantQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async productVariant(@Args() args, @Info() info) {
    return await this.prisma.binding.query.productVariant(args, info)
  }
}
