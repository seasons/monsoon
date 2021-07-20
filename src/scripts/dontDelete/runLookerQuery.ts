import "module-alias/register"

import * as util from "util"

import { LookerNodeSDK } from "@looker/sdk/lib/node"

const run = async () => {
  const client = LookerNodeSDK.init31()

  const res = await client.run_query({
    query_id: 5603,
    result_format: "json",
    limit: 1000000,
  })
  console.log(util.inspect(res, { depth: null }))
}

run()
