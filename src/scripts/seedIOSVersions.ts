import "module-alias/register"

import * as fs from "fs"

import Analytics from "analytics-node"
import csv from "csv-parser"
import { camelCase, mapKeys, pick } from "lodash"
import moment from "moment"

import { PrismaService } from "../prisma/prisma.service"

// Useful Docs: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#identify

const seed = async () => {
  let i = 0
  const iosVersionByUserId = {}
  const ps = new PrismaService()

  // Make email to id resolver map
  const users = await ps.client.users()
  const emailToIdMap = {}
  for (const u of users) {
    emailToIdMap[u.email] = u.id
  }

  const pipe = fs
    .createReadStream(`harvestIdentifies.csv`)
    .pipe(csv())
    .on("data", async row => {
      console.log(`Reading csv row ${i++} of 262773`)
      pipe.pause()
      const eventSentAt = new Date(row.sent_at)

      const userId = row.user_id.includes("@")
        ? emailToIdMap[row.user_id]
        : row.user_id

      if (userId !== "") {
        const firstTimeSeeingUser = !iosVersionByUserId[userId]
        const fresherData =
          !!iosVersionByUserId[userId] &&
          //@ts-ignore
          eventSentAt - iosVersionByUserId[userId]["timestamp"] > 0
        if (firstTimeSeeingUser || fresherData) {
          iosVersionByUserId[userId] = {
            timestamp: eventSentAt,
            version: row.context_app_version,
          }
        }
      } else {
        console.log(row)
      }

      pipe.resume()
    })
    .on("end", async () => {
      console.log("CSV file successfully processed")
      const userIds = Object.keys(iosVersionByUserId)
      const numIdsToUpdate = userIds.length
      let i = 0
      for (const id of userIds) {
        console.log(`Updating user ${i++} of ${numIdsToUpdate}`)
        try {
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
        } catch (e) {
          console.log(e)
        }
      }
    })
}

seed()
