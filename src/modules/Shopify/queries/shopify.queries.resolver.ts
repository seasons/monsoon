import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

@Resolver()
export class ShopifyQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async shopifyProductVariants(@Args() args, @Info() info) {
    return await this.prisma.binding.query.shopifyProductVariants(args, info)
  }

  @Query()
  async externalShopifyIntegrations(@Args() args, @Info() info) {
    return await this.prisma.binding.query.externalShopifyIntegrations(
      args,
      info
    )
  }
}
