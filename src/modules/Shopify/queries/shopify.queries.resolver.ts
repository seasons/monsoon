import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

@Resolver()
export class ShopifyQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async shopifyProductVariants(@FindManyArgs() args) {
    const data = this.prisma.client.shopifyProductVariant.findMany(args)
    return data
  }

  @Query()
  async shopifyShops(@FindManyArgs() args) {
    const data = this.prisma.client.shopifyShop.findMany(args)
    return data
  }
}
