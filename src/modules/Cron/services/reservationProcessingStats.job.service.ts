import { ReservationUtilsService } from "@app/modules/Utils/services/reservation.utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class ReservationProcessingStats {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationUtils: ReservationUtilsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async getReservationProcessingStats() {
    const {
      queuedReservationCount,
      queuedResProdsCount,
    } = await this.reservationUtils.getOutboundResProcessingCounts()
    const {
      deliveredToBusinessCounts,
    } = await this.reservationUtils.getInboundResProcessingCounts()

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
