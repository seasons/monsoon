import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"

import { ShopifyService } from "../services/shopify.service"

@Resolver()
export class ShopifyMutationsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopify: ShopifyService,
    private readonly queryUtils: QueryUtilsService
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
      } as Prisma.ShopifyShopUpdateInput

      const shop = await this.prisma.client2.shopifyShop.findUnique({
        where: { shopName: data.shop },
        select: { id: true },
      })

      await this.prisma.client2.shopifyShop.upsert({
        where: {
          shopName: data.shop,
        },
        create: {
          ...mutationData,
          scope: this.queryUtils.createScalarListMutateInput(
            data.scope.split(","),
            null,
            "create"
          ),
        } as Prisma.ShopifyShopCreateInput,
        update: {
          ...mutationData,
          scope: this.queryUtils.createScalarListMutateInput(
            data.scope.split(","),
            shop?.id || "",
            "update"
          ),
        },
      })
    }
  }

  @Mutation()
  async importShopifyData(@Args() { shopName, ids }) {
    const shopifyShop = await this.prisma.client2.shopifyShop.findFirst({
      where: {
        shopName,
      },
    })

    await this.shopify.importProductVariants({
      shopName: shopifyShop.shopName,
      accessToken: shopifyShop.accessToken,
      ids,
    })

    return true
  }
}
