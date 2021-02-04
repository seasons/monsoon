import fs from "fs"

import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { IndexKey } from "@app/modules/Search/services/algolia.service"
import { SearchService } from "@app/modules/Search/services/search.service"
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
    private readonly prismaSync: PrismaSyncService,
    private readonly dripSync: DripSyncService,
    private readonly scripts: ScriptsService,
    private readonly search: SearchService,
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
    const pgpassFilepath = await this.scripts.downloadFromS3(
      "/tmp/.pgpass",
      "monsoon-scripts",
      "pgpass.txt"
    )
    const envFilepath = await this.scripts.downloadFromS3(
      "/tmp/__monsoon__env.json",
      "monsoon-scripts",
      "env.json"
    )
    try {
      const env = this.scripts.readJSONObjectFromFile(envFilepath)
      this.prismaSync.setDBEnvVarsFromJSON(
        "production",
        env.postgres.production
      )
      this.prismaSync.setDBEnvVarsFromJSON(destination, {
        ...env.postgres[destination],
        ...env.prisma[destination],
      })
      process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_ID =
        env.auth0.staging["monsoon(staging)"].clientID
      process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET =
        env.auth0.staging["monsoon(staging)"].clientSecret
      this.prismaSync.syncPrisma(destination)
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
    await this.scripts.updateConnections({
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
        await this.dripSync.syncAllCustomers(batch)
        break
    }

    this.logger.log(`Complete!`)
  }

  @Command({
    command: "sync:algolia <table>",
    describe: "Sync prisma data with Algolia",
    aliases: "sa",
  })
  async syncAlgolia(
    @Positional({
      name: "table",
      type: "string",
      describe: "Name of the prisma table to sync",
      choices: ["all", "products", "physicalProducts", "brands", "customers"],
    })
    table,
    @PrismaEnvOption({
      choices: ["local", "staging", "production"],
      default: "production",
    })
    prismaEnv,
    @Option({
      name: "index",
      type: "array",
      describe: "The Algolia index to sync data into",
      choices: ["default", "admin", "customer"],
      default: "default",
      alias: "i",
    })
    indexKeys: string[]
  ) {
    await this.scripts.updateConnections({
      prismaEnv,
      moduleRef: this.moduleRef,
    })

    const shouldProceed = readlineSync.keyInYN(
      `You are about index ${
        table === "all" ? "all tables" : table
      } from \n- Prisma: ${
        process.env.PRISMA_ENDPOINT
      }\n- Algolia indices: (${indexKeys.join(", ")}).\n` + `Proceed? (y/n)`
    )
    if (!shouldProceed) {
      console.log("\nExited without running anything\n")
      return
    }

    const indices = (indexKeys || []).map(indexKey => {
      switch (indexKey) {
        case "default":
          return IndexKey.Default
        case "admin":
          return IndexKey.Admin
        case "customer":
          return IndexKey.Customer
      }
    })

    switch (table) {
      case "all":
        await this.search.indexData(indices)
        break
      case "products":
        await this.search.indexProducts(indices)
        break
      case "physicalProducts":
        await this.search.indexPhysicalProducts(indices)
        break
      case "brands":
        await this.search.indexBrands(indices)
        break
      case "customers":
        await this.search.indexCustomers(indices)
        break
    }

    this.logger.log(`Done indexing!`)
  }
}
