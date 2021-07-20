import "module-alias/register"

import * as fs from "fs"

import Analytics from "analytics-node"
import csv from "csv-parser"
import { camelCase, head, mapKeys, pick } from "lodash"
import moment from "moment"

import { PrismaService } from "../prisma/prisma.service"

// Useful Docs: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#identify

const seed = async () => {
  let i = 0
  const iosVersionByUserId = {}
  const ps = new PrismaService()

  const pipe = fs
    .createReadStream(`subscribed.csv`)
    .pipe(csv())
    .on("data", async row => {
      console.log(`Reading csv row ${i++} of 478`)
      pipe.pause()
      const eventSentAt = new Date(row.sent_at)

      const userId = row.user_id
      const cust = head(
        await ps.client.customers({ where: { user: { id: userId } } })
      )
      await ps.client.updateCustomer({
        where: { id: cust?.id || "" },
        data: {
          admissions: {
            upsert: {
              create: {
                inServiceableZipcode: true,
                admissable: true,
                authorizationsCount: 1,
                subscribedAt: eventSentAt,
              },
              update: {
                subscribedAt: eventSentAt,
              },
            },
          },
        },
      })
      pipe.resume()
    })
}

seed()
