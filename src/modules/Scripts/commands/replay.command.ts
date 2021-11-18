import { DataScheduledJobs } from "@app/modules/Cron/services/data.job.service"
import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
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
    private readonly timeUtils: TimeUtilsService,
    private readonly utils: UtilsService
  ) {}

  @Command({
    command: "replay",
    describe: "replays production requests",
    aliases: "rp",
  })
  async replay(
    @Option({
      name: "environment",
      description: "environment against which to replay events",
      default: "local",
      type: "string",
      choices: ["local", "staging"],
    })
    replayEnv,
    @Option({
      name: "startFrom",
      description:
        "ISO string for the moment in time in which you wish to replay. If none is given, defaults to 24h ago",
      default: "",
      type: "string",
    })
    startFrom
  ) {
    const urlPrefix =
      replayEnv === "local"
        ? "http://localhost:4000"
        : "https://monsoon-staging.herokuapp.com"

    // TODO: Make it pull the datadog environment variables from AWS
    const allLogs = await this.fetchLogs(startFrom)

    let log: any
    for (log of allLogs) {
      let urlSuffix
      let body = {}
      let requestUserEmail
      let url

      const attributes = log.attributes?.attributes

      const urlDetailsPath = attributes?.http?.url_details?.path
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
        body = attributes.http.body
      } else {
        urlSuffix = attributes?.req?.originalUrl
        requestUserEmail = attributes?.email
      }

      if (!urlSuffix) {
        console.dir(log, { depth: null })
        throw "Unable to construct url. Please run in debug mode to fix."
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
        if (!!requestUserEmail) {
          payload["headers"] = {
            "override-auth": requestUserEmail,
            "override-auth-token": process.env.OVERRIDE_AUTH_TOKEN,
          }
        }
      }
      axios
        .request(payload)
        .then(a => console.log(a.status))
        .catch(e => console.log(e))
      await this.utils.sleep(100)
    }
  }

  private async fetchLogs(startFrom) {
    const configuration = v2.createConfiguration()
    const apiInstance = new v2.LogsApi(configuration)

    let filterFrom =
      startFrom === ""
        ? new Date(this.timeUtils.xDaysAgoISOString(1))
        : new Date(startFrom)

    if (filterFrom.toString() === "Invalid Date") {
      this.logger.error(`Invalid date: ${startFrom}`)
      return
    }
    if (this.timeUtils.numDaysBetween(filterFrom, new Date()) >= 14) {
      this.logger.error(
        "Can only replay events from within last 14 days. Datadog does not hold older logs"
      )
      return
    }
    const filterTo = this.timeUtils.xHoursAfterDate(filterFrom, 24, "date")

    let params: v2.LogsApiListLogsGetRequest = {
      filterQuery: "service:monsoon-production",
      filterFrom: filterFrom,
      filterTo: filterTo as Date,
      sort: "timestamp",
      pageLimit: 5000, // this is the max allowed
    }

    let allLogs = []
    let i = 0
    while (true) {
      console.log(
        `Datadog fetch ${i++}. Number logs collected so far: ${allLogs.length}`
      )
      const logs = await apiInstance.listLogsGet(params)
      allLogs.push(...logs.data)
      if (logs.data.length === 0) {
        break
      } else {
        params["pageCursor"] = logs.meta.page.after
      }
    }

    const httpRequestLogs = allLogs.filter(
      a =>
        // if there's not a requestId, it's not an http request
        !!a.attributes?.attributes?.requestId &&
        // If the below applies, it's a jwt expired log
        a.attributes?.attributes?.context?.code !== "invalid_token"
    )
    return httpRequestLogs
  }
}
