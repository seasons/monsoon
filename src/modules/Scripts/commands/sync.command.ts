import { Command, Option, Positional } from "nestjs-command"

import { AirtableSyncService } from "@modules/Sync/services/sync.airtable.service"
import { Injectable } from "@nestjs/common"
import { PrismaSyncService } from "@modules/Sync/services/sync.prisma.service"
import { ScriptsService } from "../services/scripts.service"
import fs from "fs"
import readlineSync from "readline-sync"

@Injectable()
export class SyncCommands {
  constructor(
    private readonly airtableSyncService: AirtableSyncService,
    private readonly prismaSyncService: PrismaSyncService,
    private readonly scriptsService: ScriptsService
  ) {}

  @Command({
    command: "sync:airtable:airtable",
    describe: "sync airtable production to staging",
  })
  async syncAirtableToAirtable(
    @Option({
      name: "start",
      alias: "s",
      default: "Colors",
      describe: "Model to start from",
      choices: [
        "Colors",
        "Brands",
        "Models",
        "Categories",
        "Locations",
        "Sizes",
        "Top Sizes",
        "Bottom Sizes",
        "Products",
        "Homepage Product Rails",
        "Product Variants",
        "Physical Products",
        "Users",
        "Reservations",
      ],
      type: "string",
    })
    start
  ) {
    const envFilePath = await this.scriptsService.downloadFromS3(
      "/tmp/__monsoon__env.json",
      "monsoon-scripts",
      "env.json"
    )
    try {
      const env = this.scriptsService.readJSONObjectFromFile(envFilePath)
      process.env._PRODUCTION_AIRTABLE_BASEID =
        env.airtable["production"].baseID
      process.env._STAGING_AIRTABLE_BASEID = env.airtable["staging"].baseID
      await this.airtableSyncService.syncAirtableToAirtable(start)
    } catch (err) {
      console.log(err)
    } finally {
      // delete the env file
      fs.unlinkSync(envFilePath)
    }
  }

  @Command({
    command: "sync:airtable:prisma <table>",
    describe: "sync airtable data to prisma",
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
      ],
    })
    table,
    @Option({
      name: "prisma",
      alias: "pe",
      default: "staging",
      describe: "Prisma environment to sync to",
      choices: ["local", "staging", "production"],
      type: "string",
    })
    pe,
    @Option({
      name: "airtable",
      alias: "ae",
      default: "staging",
      describe: "Airtable base to sync from",
      choices: ["production", "staging"],
      type: "string",
    })
    ae
  ) {
    await this.scriptsService.overrideEnvFromRemoteConfig({
      prismaEnvironment: pe,
      airtableEnvironment: ae,
    })

    const shouldProceed = readlineSync.keyInYN(
      `You are about sync ${
        table === "all" ? "all the tables" : "the " + table
      } from airtable with baseID ${
        process.env.AIRTABLE_DATABASE_ID
      } to prisma at url ${process.env.PRISMA_ENDPOINT}\n. Proceed? (y/n)`
    )
    if (!shouldProceed) {
      console.log("\nExited without running anything\n")
      return
    }

    await this.airtableSyncService.syncAirtableToPrisma(table)
  }

  // @Command({
  //   command: "sync:prisma:prisma <destination>",
  //   describe: "sync prisma production to staging/local",
  // })
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
}
