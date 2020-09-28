import "module-alias/register"

import * as fs from "fs"

import Analytics from "analytics-node"
import csv from "csv-parser"
import { camelCase, mapKeys, pick } from "lodash"
import moment from "moment"

interface TrackPayload {
  properties: any
}

interface IdentifyPayload {
  traits: any
}

type SegmentPayload = TrackPayload | IdentifyPayload

// Useful Docs: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#identify

const writeKey = ""
const client = new Analytics(writeKey)

const uploadCSV = ({
  app = "monsoon",
  csvName,
  rowTransformFunc,
  event,
  method = "track",
  getUserIDFunc = row => row.user_id,
  stopDate,
}: {
  app?: string
  csvName: string
  rowTransformFunc: (row: any) => SegmentPayload
  event?: string
  method?: "track" | "identify"
  getUserIDFunc?: (row: any) => string
  stopDate?: Date
}) => {
  const fieldsToAddToPayloads = { integrations: { All: false, Mixpanel: true } }
  if (method === "track") {
    if (!event) {
      throw new Error("Must include event if replaying a track")
    }
    fieldsToAddToPayloads["event"] = event
  }
  if (method === "identify" && !!event) {
    throw new Error("Can not pass event on identify call")
  }

  let i = 0
  const pipe = fs
    .createReadStream(`events/${app}/${csvName}.csv`)
    .pipe(csv())
    .on("data", async row => {
      console.log(`row ${i++}`)
      pipe.pause()
      const eventSentAt = new Date(row.sent_at)
      if (moment(eventSentAt).isBefore(moment(stopDate))) {
        console.log(`sent event with timestamp: ${eventSentAt.toISOString()}`)
        const payload = {
          userId: getUserIDFunc(row),
          anonymousId: row.anonymous_id,
          ...rowTransformFunc(row),
          ...fieldsToAddToPayloads,
          timestamp: new Date(row.sent_at),
        }
        client[method](payload)
      } else {
        console.log(
          `event sent at ${eventSentAt.toISOString()} is after stop date of ${stopDate.toISOString()}`
        )
      }
      pipe.resume()
    })
    .on("end", () => {
      console.log("CSV file successfully processed")
    })
}

const createPropertiesFromCSVColumns = (row, columnNames: string[]) => {
  const x = pick(row, columnNames)
  const props = mapKeys(x, (val, key) => camelCase(key))
  return props
}

const replayHarvestData = async () => {
  uploadCSV({
    // we started sending harvest events to mixpanel on sept 18, 2020
    stopDate: new Date(2020, 8, 18),
    app: "harvest",
    csvName: "create_account_modal",
    event: "CreateAccountModal",
    rowTransformFunc: row => ({
      properties: createPropertiesFromCSVColumns(row, [
        "action_name",
        "action_type",
        "application",
        "page",
        "platform",
      ]),
    }),
  })
}

// replayMonsoonData()
replayHarvestData()
