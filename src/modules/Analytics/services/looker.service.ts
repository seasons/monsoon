import { LookerNodeSDK } from "@looker/sdk/lib/node"
import { Injectable } from "@nestjs/common"
import slugify from "slugify"

@Injectable()
export class LookerService {
  client = LookerNodeSDK.init31()

  baseURL() {
    return "https://looker.seasons.nyc"
  }

  async getGlobalMetricsDashboard() {
    const dashboard = await this.client.ok(this.client.dashboard("24"))

    const queries = []
    const elements = dashboard.dashboard_elements
      .map(element => {
        if (element.result_maker && element.result_maker.query_id) {
          queries.push(
            this.client.run_query({
              query_id: element.result_maker?.query_id,
              result_format: "json",
            })
          )

          const title = element.title ?? element?.look?.title

          return {
            id: element.id,
            type: "",
            slug: (!!title ? slugify(title) : "").toLowerCase(),
            title: title,
            view: element.look?.query?.view,
            result: {},
          }
        }

        return false
      })
      .filter(Boolean)

    const queryResults = await Promise.all(queries)

    for (let i = 0; i < elements.length; i++) {
      let element = elements[i]

      if (element) {
        element.result = queryResults[i]?.value?.[0]

        const key = Object.keys(element.result)?.[0]

        element.type = key.includes("count")
          ? "Count"
          : key.includes("Dollars")
          ? "Money"
          : "Basic"
      }
    }

    return elements
  }
}
