import fs from "fs"

import { DripSyncService } from "@app/modules/Drip/services/dripSync.service"
import { AirtableSyncService } from "@modules/Sync/services/sync.airtable.service"
import { PrismaSyncService } from "@modules/Sync/services/sync.prisma.service"
import { Injectable } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { Command, Option, Positional } from "nestjs-command"
import readlineSync from "readline-sync"

import {
  AirtableEnvOption,
  AirtableIdOption,
  PrismaEnvOption,
} from "../scripts.decorators"
import { ScriptsService } from "../services/scripts.service"

@Injectable()
export class SyncCommands {
  constructor(
    private readonly airtableSyncService: AirtableSyncService,
    private readonly prismaSyncService: PrismaSyncService,
    private readonly dripSyncService: DripSyncService,
    private readonly scriptsService: ScriptsService,
    private readonly moduleRef: ModuleRef
  ) {}

  @Command({
    command: "sync:airtable:prisma <table>",
    describe: "sync airtable data to prisma",
    aliases: "sap",
  })
  async syncAirtableToPrisma(
    @Positional({
      name: "table",
      type: "string",
      describe: "Name of the airtable base to sync",
      choices: [
        "all",
        "brands",
        "categories",
        "products",
        "product-variants",
        "collections",
        "collection-groups",
        "homepage-product-rails",
        "physical-products",
        "models",
      ],
    })
    table,
    @PrismaEnvOption({
      choices: ["local", "staging", "production"],
      default: "staging",
    })
    prismaEnv,
    @AirtableEnvOption({ choices: ["staging", "production"] })
    airtableEnv,
    @AirtableIdOption()
    abid
  ) {
    await this.scriptsService.updateConnections({
      prismaEnv,
      airtableEnv: abid || airtableEnv,
      moduleRef: this.moduleRef,
    })

    const shouldProceed = readlineSync.keyInYN(
      `You are about sync ${
        table === "all" ? "all the tables" : "the " + table
      } from airtable with baseID ${
        process.env.AIRTABLE_DATABASE_ID
      } to prisma at url ${process.env.PRISMA_ENDPOINT}.\n` +
        `${
          airtableEnv === "production"
            ? "WARNING: You should NOT run against production for dev purposes." +
              " You should instead run against staging or a duplicate of production."
            : ""
        }\n` +
        `Proceed? (y/n)`
    )
    if (!shouldProceed) {
      console.log("\nExited without running anything\n")
      return
    }

    await this.airtableSyncService.syncAirtableToPrisma(table)
  }

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
    prismaEnv
  ) {
    await this.scriptsService.updateConnections({
      prismaEnv,
      moduleRef: this.moduleRef,
    })

    const shouldProceed = readlineSync.keyInYN(
      `You are about sync ${
        table === "all" ? "all the tables" : "the " + table
      } from prisma at url ${process.env.PRISMA_ENDPOINT} to Drip .\n` +
        `Proceed? (y/n)`
    )
    if (!shouldProceed) {
      console.log("\nExited without running anything\n")
      return
    }

    switch (table) {
      case "customers":
        await this.dripSyncService.syncAllCustomers()
        break
    }
  }
}
