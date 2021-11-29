import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class OperationMetricsRecord {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async getOpsMetrics() {
    const {
      queuedReservationCount,
      queuedResProdsCount,
    } = await this.utils.getCountsForOpsMetricRecord()

    await this.prisma.client.operationMetricsRecord.create({
      data: {
        numberOfQueuedItems: queuedResProdsCount,
        numberOfQueuedReservations: queuedReservationCount,
        day: new Date(),
      },
    })
  }
}
