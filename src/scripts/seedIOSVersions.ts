import "module-alias/register"

import * as fs from "fs"

import Analytics from "analytics-node"
import csv from "csv-parser"
import { camelCase, mapKeys, pick } from "lodash"
import moment from "moment"

import { PrismaService } from "../prisma/prisma.service"

// Useful Docs: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#identify

const seed = () => {
  let i = 0
  const iosVersionByUserId = {}
  const ps = new PrismaService()
  const pipe = fs
    .createReadStream(`harvestIdentifies.csv`)
    .pipe(csv())
    .on("data", async row => {
      console.log(`row ${i++}`)
      pipe.pause()
      const eventSentAt = new Date(row.sent_at)

      const firstTimeSeeingUser = !iosVersionByUserId[row.user_id]
      const fresherData =
        //@ts-ignore
        eventSentAt - iosVersionByUserId[row.user_id]["timestamp"] > 0
      if (firstTimeSeeingUser || fresherData) {
        iosVersionByUserId[row.user_id] = {
          timestamp: eventSentAt,
          version: row.context_app_version,
        }
      }
      pipe.resume()
    })
    .on("end", async () => {
      console.log("CSV file successfully processed")
      const userIds = Object.keys(iosVersionByUserId)
      for (const id of userIds) {
        await ps.client.updateUser({
          where: { id },
          data: {
            deviceData: {
              upsert: {
                create: { iOSVersion: iosVersionByUserId[id]["version"] },
                update: { iOSVersion: iosVersionByUserId[id]["version"] },
              },
            },
          },
        })
      }
    })
}

seed()
