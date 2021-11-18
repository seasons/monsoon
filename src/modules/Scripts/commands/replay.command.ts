import { DataScheduledJobs } from "@app/modules/Cron/services/data.job.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { v2 } from "@datadog/datadog-api-client"
import { Injectable, Logger } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import axios from "axios"
import { pick } from "lodash"
import { Command, Option, Positional } from "nestjs-command"

import { PrismaEnvOption } from "../scripts.decorators"
import { ScriptsService } from "../services/scripts.service"

@Injectable()
export class ReplayCommands {
  private readonly logger = new Logger(ReplayCommands.name)

  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly moduleRef: ModuleRef
  ) {}

  @Command({
    command: "replay",
    describe: "replays production requests",
    aliases: "rp",
  })
  async replay(
    @Option({
      name: "environment",
      default: "local",
      type: "string",
      choices: ["local", "staging"],
    })
    replayEnv
  ) {
    const configuration = v2.createConfiguration()
    const apiInstance = new v2.LogsApi(configuration)
    const urlPrefix =
      replayEnv === "local"
        ? "http://localhost:4000"
        : "https://monsoon-staging.herokuapp.com"

    // TODO: Make it pull the right environment variables for the auth overriidng and DD keys from the relevant place
    let params: v2.LogsApiListLogsGetRequest = {
      //   string | Search query following logs syntax. (optional)
      filterQuery: "service:monsoon-production",
      // string | For customers with multiple indexes, the indexes to search Defaults to '*' which means all indexes (optional)
      //   filterIndex: "main",
      //   // Date | Minimum timestamp for requested logs. (optional)
      //   filterFrom: new Date("2019-01-02T09:42:36.320Z"),
      //   // Date | Maximum timestamp for requested logs. (optional)
      //   filterTo: new Date("2019-01-03T09:42:36.320Z"),
      //   // LogsSort | Order of logs in results. (optional)
      sort: "timestamp",
      //   // string | List following results with a cursor provided in the previous query. (optional)
      //   pageCursor:
      //     "eyJzdGFydEF0IjoiQVFBQUFYS2tMS3pPbm40NGV3QUFBQUJCV0V0clRFdDZVbG8zY3pCRmNsbHJiVmxDWlEifQ==",
      //   // number | Maximum number of logs in the response. (optional)
      //   pageLimit: 25,
    }

    const logs = await apiInstance.listLogsGet(params)
    const data = logs.data
    let log: any
    for (log of data) {
      let urlSuffix
      let body = {}
      let requestUserEmail
      let url

      const urlDetailsPath = log.attributes?.attributes?.http?.url_details?.path
      const isWebhookEvent = [
        "/segment_events",
        "/chargebee_events",
        "/shippo_events",
        "/sms_events",
        "/webflow_events",
        "/facebook",
        "/health",
      ].includes(urlDetailsPath)
      if (isWebhookEvent) {
        urlSuffix = urlDetailsPath
        body = log.attributes.attributes.http.body
      } else {
        urlSuffix = log?.attributes?.attributes?.req?.originalUrl
        requestUserEmail = log?.attributes?.attributes?.email
      }

      if (!urlSuffix) {
        continue
      }
      url = urlPrefix + urlSuffix
      const payload = {
        url,
      }
      if (isWebhookEvent) {
        payload["data"] = body
        payload["method"] = "post"
      } else {
        payload["method"] = "get"
        payload["headers"] = {
          "override-auth": requestUserEmail,
          "override-auth-token": process.env.OVERRIDE_AUTH_TOKEN,
        }
      }
      axios
        .request(payload)
        .then(a => console.log(a.status))
        .catch(e => console.log(e))
      await this.sleep(100)
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
