import { ErrorService } from "@app/modules/Error/services/error.service"
import { PhysicalProductService } from "@app/modules/Product"
import { PrismaService } from "@modules/../prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { chunk, head } from "lodash"

@Injectable()
export class LogsScheduledJobs {
  private readonly logger = new Logger(`Cron: ${LogsScheduledJobs.name}`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly physicalProductService: PhysicalProductService,
    private readonly error: ErrorService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async interpretPhysicalProductLogs() {
    let logsToInterpret = await this.prisma.client2.adminActionLog.findMany({
      where: {
        AND: [{ tableName: "PhysicalProduct" }, { interpretedAt: null }],
      },
      take: 10000,
    })
    logsToInterpret = this.prisma.sanitizePayload(
      logsToInterpret,
      "AdminActionLog"
    )

    const allReferencedWarehouseLocationIDs = logsToInterpret
      .filter(a => !!a.changedFields)
      .map(a => a.changedFields)
      .filter(b => b["warehouseLocation"] != null)
      .map(c => c["warehouseLocation"])
    let allReferencedWarehouseLocations = await this.prisma.client2.warehouseLocation.findMany(
      {
        where: { id: { in: allReferencedWarehouseLocationIDs } },
        select: { id: true, barcode: true },
      }
    )
    allReferencedWarehouseLocations = this.prisma.sanitizePayload(
      allReferencedWarehouseLocations,
      "WarehouseLocation"
    )

    const allPhysProdIDs = logsToInterpret.map(a => a.entityId)

    const allRelevantReservations = await this.prisma.client2.reservation.findMany(
      {
        where: { products: { some: { id: { in: allPhysProdIDs } } } },
        select: {
          id: true,
          createdAt: true,
          cancelledAt: true,
          completedAt: true,
          reservationNumber: true,
          status: true,
          products: { select: { id: true } },
        },
      }
    )

    const interpretations = this.physicalProductService.interpretPhysicalProductLogs(
      logsToInterpret,
      allReferencedWarehouseLocations,
      allRelevantReservations
    )
    const nonNullInterpretations = interpretations.filter(
      a => !!a.interpretation
    )

    const createInterpretationsPayloads = nonNullInterpretations.reduce(
      (acc, curval) => {
        acc[curval.actionId] = {
          logId: curval.actionId,
          entityId: curval.entityId,
          tableName: "PhysicalProduct",
          interpretation: curval.interpretation || "",
        }
        return acc
      },
      {}
    )

    let i = 0
    let numLogsInterpreted = 0
    let numErrors = 0
    for (const batch of chunk(logsToInterpret, 10)) {
      if (i++ >= 1000) {
        // At around 1160 chunks, we start getting mysterious DB errors
        // saying we're trying to insert a value that's too big for a varchar(25).
        // So just stop short of that so the job runs clean
        break
      }
      const createManyPayload = batch
        .map(a => createInterpretationsPayloads[a.actionId])
        .filter(b => !!b)
      try {
        await this.prisma.client2.adminActionLogInterpretation.createMany({
          data: createManyPayload,
        })
        await this.prisma.client2.adminActionLog.updateMany({
          where: { actionId: { in: batch.map(a => a.actionId) } },
          data: { interpretedAt: new Date() },
        })
        numLogsInterpreted += 10
      } catch (err) {
        // If the batch failed, try doing it one at a time
        for (const log of batch) {
          try {
            const payload = createInterpretationsPayloads[log.actionId]
            if (!!payload) {
              await this.prisma.client2.adminActionLogInterpretation.create({
                data: payload,
              })
            }
            await this.prisma.client2.adminActionLog.update({
              where: { actionId: log.actionId },
              data: { interpretedAt: new Date() },
            })
            numLogsInterpreted += 1
          } catch (err) {
            this.logger.log(err)
            numErrors++
          }
        }
      }
    }

    this.logger.log(`${numErrors} errors in admin action log interpreter`)
    this.logger.log(
      `${numLogsInterpreted} admin action logs succesfully interpreted`
    )
    if (numErrors > 0) {
      this.error.captureMessage(
        `${numErrors} errors in admin action log interpreter`
      )
    }
  }
}
