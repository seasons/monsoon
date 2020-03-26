import { Injectable } from "@nestjs/common"
import fs from "fs"
import { Command, Positional } from "nestjs-command"
import { AirtableSyncService } from "../../Sync/services/sync.airtable.service"
import { PrismaSyncService } from "../../Sync/services/sync.prisma.service"
import { ScriptsService } from "../services/scripts.service"

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
  async syncAirtableToAirtable() {
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
      await this.airtableSyncService.syncAirtableToAirtable()
    } catch (err) {
      console.log(err)
    } finally {
      // delete the env file
      fs.unlinkSync(envFilePath)
    }
  }

  @Command({
    command: "sync:prisma:prisma <destination>",
    describe: "sync prisma production to staging/local",
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
}
