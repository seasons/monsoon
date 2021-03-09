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
  async importProductVariantsForExternalShopifyIntegrations() {
    this.logger.log(
      "Run import product variants for external shopify integrations"
    )
    const externalShopifyIntegrations = await this.prisma.client.externalShopifyIntegrations(
      {
        where: {
          accessToken_not: null,
          AND: {
            shopName_not: null,
          },
        },
      }
    )

    for (const { shopName, accessToken } of externalShopifyIntegrations) {
      await this.shopify.importProductVariants({
        shopName,
        accessToken,
      })

      this.logger.log(`imported product variants for ${shopName}`)
    }

    this.logger.log(
      "Run import product variants for external shopify integrations complete"
    )
  }
}
