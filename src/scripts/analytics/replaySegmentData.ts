import "module-alias/register"

import * as fs from "fs"

import Analytics from "analytics-node"
import csv from "csv-parser"
import { camelCase, mapKeys, pick } from "lodash"

import { PrismaService } from "../../prisma/prisma.service"

const ps = new PrismaService()

// Useful Docs: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#identify

const monsoonStagingWriteKey = ""
const client = new Analytics(monsoonStagingWriteKey)

interface TrackPayload {
  properties: any
}

interface IdentifyPayload {
  traits: any
}

type SegmentPayload = TrackPayload | IdentifyPayload

const uploadCSV = ({
  csvName,
  rowTransformFunc,
  event,
  method = "track",
  getUserIDFunc = row => row.user_id,
}: {
  csvName: string
  rowTransformFunc: (row: any) => SegmentPayload
  event?: string
  method?: "track" | "identify"
  getUserIDFunc?: (row: any) => string
}) => {
  const fieldsToAddToPayloads = { integrations: { All: false, Mixpanel: true } }
  if (method === "track") {
    if (!event) {
      throw new Error("Must include error if replaying a track")
    }
    fieldsToAddToPayloads["event"] = event
  }
  if (method === "identify" && !!event) {
    throw new Error("Can not pass event on identify call")
  }

  let i = 0
  const pipe = fs
    .createReadStream(`events/monsoon/${csvName}.csv`)
    .pipe(csv())
    .on("data", async row => {
      //   if (i <= 2) {
      console.log(`row ${i++}`)
      pipe.pause()
      client[method]({
        userId: getUserIDFunc(row),
        ...rowTransformFunc(row),
        ...fieldsToAddToPayloads,
        timestamp: new Date(row.sent_at),
      })
      pipe.resume()
      //   }
    })
    .on("end", () => {
      console.log("CSV file successfully processed")
    })
}

const createPropertiesFromColumns = (row, columnNames: string[]) =>
  mapKeys(pick(row, columnNames), camelCase)

const replayCreatedAccountsFromDBRecords = async () => {
  const allCustomers = await ps.binding.query.customers(
    {},
    `{
      id
      detail {
        phoneNumber
      }
      user {
        id
        email
        firstName
        lastName
        auth0Id
        roles
      }
    }`
  )

  const createCommonFields = user => ({
    userId: user.id,
    integrations: { All: false, Mixpanel: true },
    timestamp: new Date(user.createdAt),
  })

  for (const cust of allCustomers) {
    client.identify({
      ...createCommonFields(cust.user),
      traits: {
        ...pick(cust.user, [
          "firstName",
          "lastName",
          "id",
          "email",
          "auth0Id",
          "roles",
          "createdAt",
        ]),
        phone: cust.detail.phoneNumber,
      },
    })

    client.track({
      ...createCommonFields(cust.user),
      properties: {
        name: `${cust.user.firstName} ${cust.user.lastName}`,
        ...pick(cust.user, ["firstName", "lastName", "email"]),
        customerID: cust.id,
        application: "harvest",
      },
    })
  }
}

const replayMonsoonData = () => {
  uploadCSV({
    csvName: "identifies",
    method: "identify",
    rowTransformFunc: row => ({
      traits: {
        auth0Id: row.auth0_id,
        ...createPropertiesFromColumns(row, [
          "email",
          "last_name",
          "phone",
          "first_name",
          "roles",
        ]),
      },
    }),
  })

  uploadCSV({
    csvName: "created_account",
    event: "Created Account",
    rowTransformFunc: row => ({
      properties: {
        customerID: row.customer_id,
        ...createPropertiesFromColumns(row, [
          "name",
          "last_name",
          "email",
          "first_name",
        ]),
      },
    }),
  })

  uploadCSV({
    csvName: "reserved_items",
    event: "Reserved Items",
    rowTransformFunc: row => ({
      properties: {
        reservationID: row.reservation_id,
        ...createPropertiesFromColumns(row, ["email", "units", "items"]),
      },
    }),
  })

  uploadCSV({
    csvName: "opened_hosted_checkout",
    event: "Opened Hosted Checkout",
    rowTransformFunc: row => ({
      properties: createPropertiesFromColumns(row, [
        "plan",
        "last_name",
        "email",
        "first_name",
      ]),
    }),
  })
}

replayMonsoonData()
