import { ErrorService } from "@app/modules/Error/services/error.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class ProductScheduledJobs {
  private readonly logger = new Logger(`Cron: ${ProductScheduledJobs.name}`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly timeUtils: TimeUtilsService,
    private readonly error: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async cacheRentalPrices() {
    const productsToUpdate = await this.prisma.client.product.findMany({
      where: {
        OR: [
          { updatedAt: { gte: this.timeUtils.xDaysBeforeDate(new Date(), 7) } },
          { computedRentalPrice: null },
        ],
      },
      select: {
        id: true,
        wholesalePrice: true,
        rentalPriceOverride: true,
        computedRentalPrice: true,
        recoupment: true,
      },
    })

    let i = 0
    let total = productsToUpdate.length
    for (const prod of productsToUpdate) {
      this.logger.log(
        `Updating cached rental price for prod ${i++} of ${total}`
      )
      try {
        const freshRentalPrice = this.utils.calcRentalPrice(prod)
        if (freshRentalPrice !== prod.computedRentalPrice) {
          await this.prisma.client.product.update({
            where: { id: prod.id },
            data: { computedRentalPrice: freshRentalPrice },
          })
        }
      } catch (err) {
        this.error.setExtraContext({ prod })
        this.error.captureError(err)
      }
    }
  }
}
