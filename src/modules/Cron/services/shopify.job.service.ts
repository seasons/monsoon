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
    const shopifyShops = await this.prisma.client.shopifyShops({
      where: {
        accessToken_not: null,
        AND: {
          shopName_not: null,
        },
      },
    })

    for (const { shopName, accessToken, id } of shopifyShops) {
      const brands = await this.prisma.client.brands({
        where: {
          shopifyShop: { id },
        },
      })

      if (!brands || brands.length === 0) {
        this.logger.log(`Unable to find brand for ShopifyShop: ${id}`)
        continue
      }

      try {
        await this.shopify.importProductVariants({
          shopName,
          accessToken,
          brandId: brands[0].id,
        })
      } catch (error) {
        this.logger.log(`failed to import product variants: ${error}`)
      }

      this.logger.log(`imported product variants for ${shopName}`)
    }

    this.logger.log(
      "Run import product variants for external shopify integrations complete"
    )
  }
}
