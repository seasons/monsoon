import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

import { ShopifyService } from "../services/shopify.service"

@Resolver()
export class ShopifyMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopify: ShopifyService
  ) {}

  @Mutation()
  async sendShopifyData(@Args() { data }) {
    if (!data.isOnline) {
      // The access token is offline mode
      // We can safely persist it in the database
      const mutationData = {
        shopName: data.shop,
        accessToken: data.accessToken,
        enabled: true,
        // scope: data.scope.split(',')
      }
      await this.prisma.client.upsertExternalShopifyIntegration({
        where: {
          shopName: data.shop,
        },
        create: {
          ...mutationData,
        },
        update: {
          ...mutationData,
        },
      })

      await this.shopify.importProductVariants({
        shopName: data.shop,
        accessToken: data.accessToken,
      })
    }
    console.log(data)
  }

  @Mutation()
  async importShopifyData(@Args() { shopName }) {
    const shopifyShop = await this.prisma.client.externalShopifyIntegration({
      shopName,
    })

    await this.shopify.importProductVariants({
      shopName: shopifyShop.shopName,
      accessToken: shopifyShop.accessToken,
    })

    return true
  }
}
