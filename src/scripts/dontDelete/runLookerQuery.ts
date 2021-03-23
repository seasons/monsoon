import "module-alias/register"

import { LookerNodeSDK } from "@looker/sdk/lib/node"

const run = async () => {
  const client = LookerNodeSDK.init31()

  const res = await client.run_query({
    query_id: 4929,
    result_format: "json",
    server_table_calcs: true,
  })
  console.log(res)
}

run()
