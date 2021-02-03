import { LookerNodeSDK } from "@looker/sdk/lib/node"
;(async () => {
  // create a Node SDK object for API 3.1
  const sdk = LookerNodeSDK.init31()
  // retrieve your user account to verify correct credentials
  const me = await sdk.ok(
    sdk.me(
      "id, first_name, last_name, display_name, email, personal_space_id, home_space_id, group_ids, role_ids"
    )
  )
  console.log({ me })
  // make any other calls to the Looker SDK
  const dashboard = await sdk.ok(sdk.dashboard("24"))

  //   console.log(dashboard)
  const queries = []
  const elements = dashboard.dashboard_elements
    .map(element => {
      if (element.result_maker && element.result_maker.query_id) {
        queries.push(
          sdk.run_query({
            query_id: element.result_maker?.query_id,
            result_format: "json",
          })
        )

        return {
          id: element.id,
          title: element.title,
          view: element.look?.query?.view,
          result: {},
        }
      }

      return false
    })
    .filter(Boolean)

  const queryResults = await Promise.all(queries)

  console.log(queryResults)
  console.log(elements)

  for (let i = 0; i < elements.length; i++) {
    let element = elements[i]

    if (element) {
      element.result = queryResults[0]?.value
    }
  }

  await sdk.authSession.logout()
  if (!sdk.authSession.isAuthenticated()) {
    console.log("Logout successful")
  }
})()
