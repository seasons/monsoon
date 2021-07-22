import { DataScheduledJobs } from "@app/modules/Cron/services/data.job.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { pick } from "lodash"
import { Command, Option, Positional } from "nestjs-command"

import { PrismaEnvOption } from "../scripts.decorators"
import { ScriptsService } from "../services/scripts.service"

@Injectable()
export class DataCommands {
  private readonly logger = new Logger(DataCommands.name)

  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly dataJobs: DataScheduledJobs,
    private readonly moduleRef: ModuleRef,
    private readonly prisma: PrismaService
  ) {}

  @Command({
    command: "healthcheck",
    describe: "check the health of the database",
    aliases: "hc",
  })
  async healthCheck(
    @PrismaEnvOption({
      choices: ["local", "staging", "production"],
    })
    prismaEnv,
    @Option({
      name: "withDetails",
      alias: "wd",
      type: "boolean",
      default: false,
      describe: "show details for nonzero parameters",
    })
    withDetails
  ) {
    await this.scriptsService.updateConnections({
      prismaEnv,
      moduleRef: this.moduleRef,
    })
    console.log("Running health check...")
    await this.dataJobs.checkAll(withDetails)
  }

  @Command({
    command: "get:reservation-history <seasonsUID>",
    describe: "get the reservation history for a given physical product",
    aliases: "grh",
  })
  async getReservationHistory(
    @Positional({
      name: "seasonsUID",
      type: "string",
      describe: "seasonsUID of the item",
    })
    seasonsUID,
    @PrismaEnvOption({
      choices: ["local", "staging", "production"],
    })
    prismaEnv
  ) {
    await this.scriptsService.updateConnections({
      prismaEnv,
      moduleRef: this.moduleRef,
    })
    const physProd = await this.prisma.client2.physicalProduct.findUnique({
      where: { seasonsUID },
    })
    if (!physProd) {
      this.logger.error(
        `No Physical Product found with seasonsUID: ${seasonsUID}`
      )
      return
    }
    const _reservations = await this.prisma.client2.reservation.findMany({
      where: { products: { some: { seasonsUID } } },
      orderBy: { createdAt: "asc" },
      select: {
        status: true,
        reservationNumber: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: { user: { select: { email: true } } },
        },
      },
    })
    const reservations = this.prisma.sanitizePayload(
      _reservations,
      "Reservation"
    )
    const formattedReservations = reservations.map(a => ({
      ...pick(a, [
        "reservationNumber",
        "status",
        "customer.user.email",
        "createdAt",
        "updatedAt",
      ]),
    }))
    if (formattedReservations.length === 0) {
      this.logger.log("Item has never been reserved")
    }
    this.logger.log(`*** Reservation History ***`)
    this.logger.log(formattedReservations)
  }
}
