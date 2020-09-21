import "module-alias/register"

import * as fs from "fs"

import Analytics from "analytics-node"
import csv from "csv-parser"
import { camelCase, mapKeys, pick } from "lodash"

import { EmailReceiptWhereInput } from "../../prisma/prisma.binding"
import { PrismaService } from "../../prisma/prisma.service"

interface TrackPayload {
  properties: any
}

interface IdentifyPayload {
  traits: any
}

type SegmentPayload = TrackPayload | IdentifyPayload

interface ReplayEventsFromDBRecords {
  query: string
  getUserIdFunc: (rec) => string
  createPayloadFunc: (rec) => any
  getTimestampFunc?: (rec) => Date
  shouldSendEventFunc?: (rec) => boolean
  where?: any
  event?: string
  method?: "identify" | "track"
  info: any
}

const ps = new PrismaService()

// Useful Docs: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#identify

const writeKey = ""
const client = new Analytics(writeKey)

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
      throw new Error("Must include event if replaying a track")
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
      console.log(`row ${i++}`)
      pipe.pause()
      const payload = {
        userId: getUserIDFunc(row),
        ...rowTransformFunc(row),
        ...fieldsToAddToPayloads,
        timestamp: new Date(row.sent_at),
      }
      client[method](payload)
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

const replayEventFromDBRecords = async ({
  query,
  getUserIdFunc,
  createPayloadFunc,
  getTimestampFunc = rec => new Date(rec.createdAt),
  shouldSendEventFunc = rec => true,
  where = {},
  event,
  method = "track",
  info,
}: ReplayEventsFromDBRecords) => {
  if (method === "identify" && !!event) {
    throw new Error("Can not pass event on identify call")
  }
  if (method === "track" && !event) {
    throw new Error("Must pass event on track call")
  }

  try {
    const records = await ps.binding.query[query](where, info)

    const createCommonFields = rec => ({
      userId: getUserIdFunc(rec),
      integrations: { All: false, Mixpanel: true },
      timestamp: getTimestampFunc(rec),
      ...(!!event ? { event } : {}),
    })

    const payloadKey = method === "identify" ? "traits" : "properties"
    let i = 0
    for (const rec of records) {
      console.log(
        `Record ${i++} of ${(records as any[]).length} for ${
          method === "track" ? `event: ${event}` : "identify"
        }`
      )
      if (shouldSendEventFunc(rec)) {
        const payload = {
          ...createCommonFields(rec),
          [payloadKey]: createPayloadFunc(rec),
        }
        client[method](payload)
      }
    }
  } catch (err) {
    console.log(err)
  }
}

const getNameAndEmailFromUser = user =>
  pick(user, ["firstName", "lastName", "email"])

const replayMonsoonData = async () => {
  // Created Account and Identify
  const CreatedAccountAndIdentifyCommonParams = {
    query: "customers",
    info: `{
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
              createdAt
            }
          }`,
    getUserIdFunc: rec => rec.user.id,
    getTimestampFunc: rec => new Date(rec.user.createdAt),
  } as Partial<ReplayEventsFromDBRecords>
  await replayEventFromDBRecords({
    ...CreatedAccountAndIdentifyCommonParams,
    method: "identify",
    createPayloadFunc: rec => ({
      ...pick(rec.user, [
        "firstName",
        "lastName",
        "id",
        "email",
        "auth0Id",
        "roles",
        "createdAt",
      ]),
      phone: rec.detail.phoneNumber,
    }),
  } as ReplayEventsFromDBRecords)
  await replayEventFromDBRecords({
    ...CreatedAccountAndIdentifyCommonParams,
    event: "Created Account",
    createPayloadFunc: rec => ({
      name: `${rec.user.firstName} ${rec.user.lastName}`,
      ...getNameAndEmailFromUser(rec.user),
      customerID: rec.id,
    }),
  } as ReplayEventsFromDBRecords)

  // Reserved Items
  await replayEventFromDBRecords({
    query: "reservations",
    info: `{
      id
      user {
        id
        email
        firstName
        lastName
      }
      products {
        seasonsUID
        productVariant {
          id
        }
      }
      createdAt
    }`,
    getUserIdFunc: rec => rec.user.id,
    event: "Reserved Items",
    createPayloadFunc: rec => ({
      ...getNameAndEmailFromUser(rec.user),
      reservationID: rec.id,
      items: rec.products.map(a => a.productVariant.id),
      units: rec.products.map(a => a.seasonsUID),
      application: "harvest",
    }),
  })

  // Became Authorized
  await replayEventFromDBRecords({
    query: "emailReceipts",
    where: { where: { emailId: "CompleteAccount" } as EmailReceiptWhereInput },
    info: `{user {id firstName lastName email} createdAt}`,
    getUserIdFunc: rec => rec.user.id,
    event: "Became Authorized",
    createPayloadFunc: rec => ({
      ...getNameAndEmailFromUser(rec.user),
      method: "Manual",
    }),
  })

  // We have no records on whether or not someone opened a hosted checkout
  // besides the actual event data, so we leave this one as is.
  uploadCSV({
    csvName: "opened_hosted_checkout",
    event: "Opened Hosted Checkout",
    rowTransformFunc: row => ({
      properties: createPropertiesFromCSVColumns(row, [
        "plan",
        "last_name",
        "email",
        "first_name",
      ]),
    }),
  })
}

replayMonsoonData()
