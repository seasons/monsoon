import "module-alias/register"

import * as fs from "fs"

import { v2 } from "@datadog/datadog-api-client"
import axios from "axios"

const configuration = v2.createConfiguration()
const apiInstance = new v2.LogsApi(configuration)

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
  //   sort: "timestamp",
  //   // string | List following results with a cursor provided in the previous query. (optional)
  //   pageCursor:
  //     "eyJzdGFydEF0IjoiQVFBQUFYS2tMS3pPbm40NGV3QUFBQUJCV0V0clRFdDZVbG8zY3pCRmNsbHJiVmxDWlEifQ==",
  //   // number | Maximum number of logs in the response. (optional)
  //   pageLimit: 25,
}

// apiInstance
//   .aggregateLogs(params)
//   .then((data: any) => {
//     console.log(
//       "API called successfully. Returned data: " + JSON.stringify(data)
//     )
//   })
//   .catch((error: any) => console.error(error))

// Only get logs from monsoon-production
//
const run = async () => {
  //   const url =
  //     "http://localhost:4000/?operationName=GetProduct&variables=%7B%22slug%22%3A%22erl1-lightning-bolt-padded-jacket-yellow%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%224c8eb4d7b147abd91b30fc4711b3150603c3a55081ed0cc6efd38b470adcb874%22%7D%7D"
  //   const response = await axios.request({
  //     method: "get",
  //     url,
  //     headers: {
  //       "override-auth": "faiyam@faiyamrahman.com",
  //       "override-auth-token": "dev_overrideauth_token",
  //     },
  //   })
  //   console.dir(response.data, { depth: null })

  const logs = await apiInstance.listLogsGet(params)
  const data = logs.data
  let log: any
  for (log of data) {
    let urlSuffix
    let body = {}
    let requestUserEmail
    let url

    const urlDetailsPath = log.attributes?.attributes?.http?.url_details?.path
    // TODO: Add support for other webhooks
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
    url = "http://localhost:4000" + urlSuffix
    try {
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
          "override-auth-token": "dev_overrideauth_token",
        }
      }
      console.log(payload)
      const response = await axios.request(payload)
      console.log(`request status: ${response.status}`)
    } catch (err) {
      console.log(err)
    }
  }
}
run()
