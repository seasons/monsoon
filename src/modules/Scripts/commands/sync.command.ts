import fs from "fs"

import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { PrismaSyncService } from "@modules/Sync/services/sync.prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { Command, Option, Positional } from "nestjs-command"
import readlineSync from "readline-sync"

import { PrismaEnvOption } from "../scripts.decorators"
import { ScriptsService } from "../services/scripts.service"

@Injectable()
export class SyncCommands {
  private readonly logger = new Logger(SyncCommands.name)

  constructor(
    private readonly prismaSyncService: PrismaSyncService,
    private readonly dripSyncService: DripSyncService,
    private readonly scriptsService: ScriptsService,
    private readonly moduleRef: ModuleRef
  ) {}

  @Command({
    command: "sync:prisma:prisma <destination>",
    describe: "sync prisma production to staging/local",
    aliases: "spp",
  })
  async syncPrismaToPrisma(
    @Positional({
      name: "destination",
      type: "string",
      describe: "Prisma environment to sync to",
      choices: ["staging", "local"],
    })
    destination
  ) {
    const pgpassFilepath = await this.scriptsService.downloadFromS3(
      "/tmp/.pgpass",
      "monsoon-scripts",
      "pgpass.txt"
    )
    const envFilepath = await this.scriptsService.downloadFromS3(
      "/tmp/__monsoon__env.json",
      "monsoon-scripts",
      "env.json"
    )
    try {
      const env = this.scriptsService.readJSONObjectFromFile(envFilepath)
      this.prismaSyncService.setDBEnvVarsFromJSON(
        "production",
        env.postgres.production
      )
      this.prismaSyncService.setDBEnvVarsFromJSON(destination, {
        ...env.postgres[destination],
        ...env.prisma[destination],
      })
      process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_ID =
        env.auth0.staging["monsoon(staging)"].clientID
      process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET =
        env.auth0.staging["monsoon(staging)"].clientSecret
      this.prismaSyncService.syncPrisma(destination)
    } catch (err) {
      console.log(err)
    } finally {
      fs.unlinkSync(pgpassFilepath)
      fs.unlinkSync(envFilepath)
    }
  }

  @Command({
    command: "sync:drip <table>",
    describe: "sync prisma data with Drip",
    aliases: "sd",
  })
  async syncDrip(
    @Positional({
      name: "table",
      type: "string",
      describe: "Name of the prisma table to sync",
      choices: ["customers"],
    })
    table,
    @PrismaEnvOption({
      choices: ["local", "staging", "production"],
      default: "production",
    })
    prismaEnv,
    @Option({
      name: "drip",
      describe: `Drip environment command runs against.`,
      choices: ["staging", "production"],
      type: "string",
      default: "staging",
      alias: "de",
    })
    dripEnv,
    @Option({
      name: "batch",
      describe: `Sync in 1000 length batches, or one at a time.`,
      type: "boolean",
      default: "true",
    })
    batch
  ) {
    await this.scriptsService.updateConnections({
      dripEnv,
      prismaEnv,
      moduleRef: this.moduleRef,
    })

    const shouldProceed = readlineSync.keyInYN(
      `You are about sync ${
        table === "all" ? "all the tables" : "the " + table
      } from prisma at url ${
        process.env.PRISMA_ENDPOINT
      } to ${dripEnv} Drip.\n` + `Proceed? (y/n)`
    )
    if (!shouldProceed) {
      console.log("\nExited without running anything\n")
      return
    }

    switch (table) {
      case "customers":
        await this.dripSyncService.syncAllCustomers(batch)
        break
    }

    this.logger.log(`Complete!`)
  }
}
