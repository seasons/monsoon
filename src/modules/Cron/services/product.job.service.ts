import { ErrorService } from "@app/modules/Error/services/error.service"
import { ProductUtilsService } from "@app/modules/Product"
import { PhysicalProductUtilsService } from "@app/modules/Product/services/physicalProduct.utils.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
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
    private readonly physicalProductUtils: PhysicalProductUtilsService,
    private readonly productUtils: ProductUtilsService,
    private readonly timeUtils: TimeUtilsService,
    private readonly error: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateProductFields() {
    const syncTiming = await this.utils.getSyncTimingsRecord("Next")
    const allPhysicalProducts = (await this.prisma.client.physicalProduct.findMany(
      {
        where: {
          createdAt: { gte: syncTiming.syncedAt },
        },
        select: {
          id: true,
          sequenceNumber: true,
          productVariant: {
            select: {
              internalSize: { select: { display: true } },
              product: {
                select: {
                  color: { select: { name: true } },
                  brand: { select: { name: true } },
                },
              },
            },
          },
        },
      }
    )) as any[]

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

    await this.prisma.client.syncTiming.create({
      data: { syncedAt: new Date(), type: "Next" },
    })

    this.logger.log(`[ByNext] Successfully synced ${total} physical products`)
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async cacheRentalPrices() {
    const productsToUpdate = await this.prisma.client.product.findMany({
      where: {
        updatedAt: { gte: this.timeUtils.xDaysBeforeDate(new Date(), 7) },
      },
      select: {
        id: true,
        wholesalePrice: true,
        rentalPriceOverride: true,
        cachedRentalPrice: true,
        recoupment: true,
      },
    })

    for (const prod of productsToUpdate) {
      try {
        const freshRentalPrice = this.productUtils.calcRentalPrice(prod)
        if (freshRentalPrice !== prod.cachedRentalPrice) {
          await this.prisma.client.product.update({
            where: { id: prod.id },
            data: { cachedRentalPrice: freshRentalPrice },
          })
        }
      } catch (err) {
        this.error.setExtraContext({ prod })
        this.error.captureError(err)
      }
    }
  }
}
