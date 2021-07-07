import { PhysicalProductUtilsService } from "@app/modules/Product/services/physicalProduct.utils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import axios from "axios"
import { chunk } from "lodash"

@Injectable()
export class ProductScheduledJobs {
  private readonly logger = new Logger(`Cron: ${ProductScheduledJobs.name}`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly physicalProductUtils: PhysicalProductUtilsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateProductFields() {
    const syncTiming = await this.utils.getSyncTimingsRecord("Next")
    const allPhysicalProducts = await this.prisma.binding.query.physicalProducts(
      {
        where: {
          createdAt_gte: syncTiming.syncedAt,
        },
      },
      `
      {
          id
          sequenceNumber
          productVariant {
              internalSize {
                  display
              }
              product { 
                  color {
                      name
                  }
                  brand { 
                      name
                  }
              }
          }
      }
    `
    )

    this.logger.log(`[ByNext] Starting physical product sync with ByNext`)

    const total = allPhysicalProducts.length
    const chunks = chunk(allPhysicalProducts, 100)

    for (const set of chunks) {
      const data = {
        items: set.map(({ id, sequenceNumber, productVariant }) => ({
          id,
          barcode: this.physicalProductUtils.sequenceNumberToBarcode(
            sequenceNumber
          ),
          brand: productVariant.product.brand.name,
          size: productVariant.internalSize.display,
          colors: productVariant.product.color.name,
        })),
      }
      try {
        const res = await axios.post(process.env.BYNEXT_ENDPOINT, data, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "seasons-token": process.env.BYNEXT_SEASONS_TOKEN,
            "postman-token": process.env.BYNEXT_POSTMAN_TOKEN,
          },
        })
        console.log(res)
      } catch (err) {
        console.log(err)
        this.logger.error(`[ByNext] error while syncing physical products`, err)
      }
    }

    await this.prisma.client.createSyncTiming({
      syncedAt: new Date(),
      type: "Next",
    })

    this.logger.log(`[ByNext] Successfully synced ${total} physical products`)
  }
}
