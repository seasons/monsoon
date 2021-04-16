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
    const allLogs = (await this.prisma.client.adminActionLogs({
      where: { tableName: "PhysicalProduct" },
    })) as AdminActionLog[]
    const logsToInterpret = allLogs.filter(a => !a.interpretedAt)

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

    // For some reason, binding won't let us query completedAt and cancelledAt...
    // So we hack around it by doing two queries and merging the data
    let allRelevantReservations = (await this.prisma.binding.query.reservations(
      {
        where: { products_some: { id_in: allPhysProdIDs } },
      },
      `{
          id
          products {
            id
          }
        }`
    )) as Reservation[]
    const allRelevantReservationsWithCompletedAndCancelledAtDates = (await this.prisma.client.reservations(
      {
        where: { products_some: { id_in: allPhysProdIDs } },
      }
    )) as Reservation[]
    allRelevantReservationsWithCompletedAndCancelledAtDates.forEach(a => {
      const matchingReservationIndex = allRelevantReservations.findIndex(
        b => a.id === b.id
      )
      allRelevantReservations[matchingReservationIndex] = {
        ...allRelevantReservations[matchingReservationIndex],
        ...a,
      }
    })

    const interpretations = this.physicalProductService.interpretPhysicalProductLogs(
      logsToInterpret,
      allReferencedWarehouseLocations,
      allRelevantReservations
    )
    const nonNullInterpretations = interpretations.filter(
      a => !!a.interpretation
    )

    for (const log of logsToInterpret) {
      const interpretedLog = nonNullInterpretations.find(
        a => a.actionId == log.actionId
      )
      if (!!interpretedLog) {
        await this.prisma.client.createAdminActionLogInterpretation({
          log: { connect: { actionId: log.actionId } },
          entityId: log.entityId,
          tableName: "PhysicalProduct",
          interpretation: interpretedLog.interpretation || "", // may be undefined,
        })
      }
      await this.prisma.client.updateAdminActionLog({
        where: { actionId: log.actionId },
        data: { interpretedAt: new Date() },
      })
    }
  }
}
