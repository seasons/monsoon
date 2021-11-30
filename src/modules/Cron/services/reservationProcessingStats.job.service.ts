import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class ReservationProcessingStats {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async getReservationProcessingStats() {
    const {
      queuedReservationCount,
      queuedResProdsCount,
    } = await this.utils.getOutboundResProcessingCounts()
    const {
      deliveredToBusinessCounts,
    } = await this.utils.getInboundResProcessingCounts()

    return await this.prisma.client.reservationProcessingStats.create({
      data: {
        initialNumQueuedItems: queuedResProdsCount,
        initialNumQueuedReservations: queuedReservationCount,
        currentNumQueuedItems: queuedResProdsCount,
        currentNumQueuedReservations: queuedReservationCount,
        initialNumDeliveredToBusinessItems: deliveredToBusinessCounts,
        currentNumDeliveredToBusinessItems: deliveredToBusinessCounts,
        day: new Date(),
      },
    })
  }
}
