import "module-alias/register"

import * as fs from "fs"

import Analytics from "analytics-node"
import csv from "csv-parser"

// Useful Docs: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#identify

const monsoonStagingWriteKey = ""
const client = new Analytics(monsoonStagingWriteKey)

interface CommonPayload {
  userId: string
  timestamp: Date
}
const uploadCSV = ({
  csvName,
  event,
  method = "track",
  rowTransformFunc,
}: {
  csvName: string
  event?: string
  method?: "track" | "identify"
  rowTransformFunc: (
    row: any
  ) =>
    | (CommonPayload & {
        properties: any
      })
    | (CommonPayload & { traits: any })
}) => {
  let i = 0
  const fieldsToAddToPayloads = { integrations: { All: false, Mixpanel: true } }
  if (method === "track") {
    if (!event) {
      throw new Error("Must include error if replaying a track")
    }
    fieldsToAddToPayloads["event"] = event
  }
  const pipe = fs
    .createReadStream(`events/${csvName}`)
    .pipe(csv())
    .on("data", async row => {
      //   if (i <= 2) {
      console.log(`row ${i++}`)
      pipe.pause()
      client[method]({
        ...rowTransformFunc(row),
        event,
      })
      pipe.resume()
      //   }
    })
    .on("end", () => {
      console.log("CSV file successfully processed")
    })
}

const replayMonsoonData = () => {
  //   uploadCSV({
  //     csvName: "created_account.csv",
  //     event: "Created Account",
  //     rowTransformFunc: row => ({
  //       userId: row.user_id,
  //       properties: {
  //         customerID: row.customer_id,
  //         email: row.email,
  //         firstName: row.first_name || "",
  //         lastName: row.last_name || "",
  //         name: row.name,
  //       },
  //       timestamp: new Date(row.sent_at),
  //     }),
  //   })

  //   uploadCSV({
  //     csvName: "reserved_items.csv",
  //     event: "Reserved Items",
  //     rowTransformFunc: row => ({
  //       userId: row.user_id,
  //       properties: {
  //         units: row.units,
  //         items: row.items,
  //         reservationID: row.reservation_id,
  //         email: row.email,
  //       },
  //       timestamp: new Date(row.sent_at),
  //     }),
  //   })

  uploadCSV({
    csvName: "identifies.csv",
    method: "identify",
    rowTransformFunc: row => ({
      userId: row.user_id,
      traits: {
        auth0Id: row.auth0_id,
        email: row.email,
        lastName: row.last_name,
        phone: row.phone || "",
        firstName: row.first_name,
        roles: row.roles,
      },
      timestamp: new Date(row.sent_at),
    }),
  })
}

replayMonsoonData()
