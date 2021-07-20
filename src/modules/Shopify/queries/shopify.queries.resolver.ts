import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

@Resolver()
export class ShopifyQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async shopifyProductVariants(@FindManyArgs() args) {
    const _data = this.prisma.client2.shopifyProductVariant.findMany(args)
    return this.prisma.sanitizePayload(_data, "ShopifyProductVariant")
  }

  @Query()
  async shopifyShops(@FindManyArgs() args) {
    const _data = this.prisma.client2.shopifyShop.findMany(args)
    return this.prisma.sanitizePayload(_data, "ShopifyShop")
  }
}
