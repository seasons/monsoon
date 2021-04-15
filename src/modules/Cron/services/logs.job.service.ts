import { PhysicalProductService } from "@app/modules/Product"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { AdminActionLog, Reservation } from "@app/prisma"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"

@Injectable()
export class LogsScheduledJobs {
  private readonly logger = new Logger(`Cron: ${LogsScheduledJobs.name}`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly physicalProductService: PhysicalProductService
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async interpretPhysicalProductLogs() {
    const logsToInterpret = (await this.prisma.binding.query.adminActionLogs(
      {
        where: {
          AND: [{ interpretedAt: null }, { tableName: "PhysicalProduct" }],
        },
      },
      `{
      actionId
      entityId
      action
      changedFields
    }`
    )) as AdminActionLog[]

    const allReferencedWarehouseLocationIDs = logsToInterpret
      .filter(a => !!a.changedFields)
      .map(a => a.changedFields)
      .filter(b => b["warehouseLocation"] != null)
      .map(c => c["warehouseLocation"])
    const allReferencedWarehouseLocations = await this.prisma.binding.query.warehouseLocations(
      { where: { id_in: allReferencedWarehouseLocationIDs } },
      `{
        id
        barcode
      }`
    )

    const allPhysProdIDs = logsToInterpret.map(a => a.entityId)
    const allRelevantReservations = (await this.prisma.binding.query.reservations(
      { where: { products_some: { id_in: allPhysProdIDs } } },
      `{
        id
        createdAt
        completedAt
        cancelledAt
        reservationNumber
      }`
    )) as any
    const interpretations = this.physicalProductService.interpretPhysicalProductLogs(
      logsToInterpret,
      allReferencedWarehouseLocations,
      allRelevantReservations
    )

    for (const log of logsToInterpret) {
      const interpretedLog = interpretations.find(
        a => a.actionId == log.actionId
      )
      await this.prisma.client.createAdminActionLogInterpretation({
        log: { connect: { actionId: log.actionId } },
        entityId: log.entityId,
        tableName: "PhysicalProduct",
        interpretation: interpretedLog.interpretation, // may be undefined,
      })
      await this.prisma.client.updateAdminActionLog({
        where: { actionId: log.actionId },
        data: { interpretedAt: new Date() },
      })
    }
  }
}
