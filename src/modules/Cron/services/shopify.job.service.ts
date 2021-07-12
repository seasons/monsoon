import { ShopifyService } from "@app/modules/Shopify/services/shopify.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class ShopifyScheduledJobs {
  private readonly logger = new Logger(ShopifyScheduledJobs.name)

  constructor(
    private readonly shopify: ShopifyService,
    private readonly prisma: PrismaService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async importProductVariantsForShopifyShops() {
    this.logger.log(
      "Run import product variants for external shopify integrations"
    )
    const _shopifyShops = await this.prisma.client2.shopifyShop.findMany({
      where: {
        accessToken: { not: undefined },
        shopName: { not: undefined },
      },
    })
    const shopifyShops = this.prisma.sanitizePayload(
      _shopifyShops,
      "ShopifyShop"
    )

    for (const { shopName, accessToken, id } of shopifyShops) {
      const brand = await this.prisma.client2.brand.findFirst({
        where: {
          shopifyShop: { id },
        },
        select: { id: true },
      })

      if (!brand) {
        this.logger.log(`Unable to find brand for ShopifyShop: ${shopName}`)
        continue
      }

      try {
        await this.shopify.importProductVariants({
          shopName,
          accessToken,
          brandId: brand.id,
        })
      } catch (error) {
        this.logger.log(
          `failed to import product variants: ${JSON.stringify(error)}`
        )
      }

      this.logger.log(`imported product variants for ${shopName}`)
    }

    this.logger.log(
      "Run import product variants for external shopify integrations complete"
    )
  }
}
