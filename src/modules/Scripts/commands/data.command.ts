import { DataScheduledJobs } from "@app/modules/Cron/services/data.job.service"
import { Injectable } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { Command, Option } from "nestjs-command"

import { PrismaEnvOption } from "../scripts.decorators"
import { ScriptsService } from "../services/scripts.service"

@Injectable()
export class DataCommands {
  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly dataJobs: DataScheduledJobs,
    private readonly moduleRef: ModuleRef
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
}
