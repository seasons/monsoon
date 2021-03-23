import { LookerNodeSDK } from "@looker/sdk/lib/node"
import { Injectable } from "@nestjs/common"
import slugify from "slugify"

type GlobalDashboardQuerySlug =
  | "percentage-of-referring-customers"
  | "avg-referrals-per-referring-customer"
  | "account-creations-by-platform"
  | "reservations-by-platform"
  | string
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
              limit: 100000, // may need to update in future. Essentially, "infinity"
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
        element.result = this.extractValueFromQueryResult(
          queryResults[i],
          element.slug
        )

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

  private extractValueFromQueryResult(
    result: any,
    slug: GlobalDashboardQuerySlug
  ) {
    let val = result?.value
    switch (slug) {
      case "account-creations-by-platform":
        return {
          [val?.[0]?.["created_account.application"]]: val?.[0]?.[
            "created_account.count"
          ],
          [val?.[1]?.["created_account.application"]]: val?.[1]?.[
            "created_account.count"
          ],
        }
      case "reservations-by-platform":
        return {
          [val?.[0]?.["reserved_items.application"]]: val?.[0]?.[
            "reserved_items.count"
          ],
          [val?.[1]?.["reserved_items.application"]]: val?.[1]?.[
            "reserved_items.count"
          ],
        }
      case "accounts-created-per-month":
        return val?.reduce((acc, curVal) => {
          acc[curVal["user.created_month"]] = curVal["user.count"]
          return acc
        }, {})
      case "web-acquisition-funnel":
      case "ios-acquisition-funnel":
      case "overall-acquisition-funnel":
        return {
          created_account: val?.[0]?.["created_account.count"],
          subscribed: val?.[0]?.["subscribed.count_distinct_ids"],
        }
      case "active-paused-or-admissable-customers-by-latlng":
        return val?.map(a => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: a["location.Coordinates"].reverse(),
          },
          properties: {
            subscriptionStatus: a["subscription.status"],
            customerStatus: a["customer.status"],
            admissable: a["customer_admissions_data.admissable"],
            count: a["customer.count"],
          },
        }))
      default:
        return val?.[0]
    }
  }
}
