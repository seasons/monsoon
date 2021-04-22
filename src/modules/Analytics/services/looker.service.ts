import { LookerNodeSDK } from "@looker/sdk/lib/node"
import { Injectable } from "@nestjs/common"
import { values } from "lodash"
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

        try {
          element.type = key.includes("count")
            ? "Count"
            : key.includes("Dollars")
            ? "Money"
            : "Basic"
        } catch (err) {
          console.log(element)
        }
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
        return this.extractMultiKeyCountsResult(
          val,
          "created_account.application",
          "created_account.count"
        )
      case "reservations-by-platform":
        return this.extractMultiKeyCountsResult(
          val,
          "reserved_items.application",
          "reserved_items.count"
        )
      case "subscribed-events-by-platform":
        return this.extractMultiKeyCountsResult(
          val,
          "subscribed.application",
          "subscribed.count"
        )
      case "subscribe-speed":
        return this.extractMultiKeyCountsResult(
          val,
          "customer.subscribe_speed",
          "customer.count"
        )
      case "accounts-created-per-month":
        return this.extractMultiKeyCountsResult(
          val,
          "user.created_month",
          "user.count"
        )
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
      case "ios-version-table":
        const returnableValues = val?.filter(a => {
          const isActiveOrPausedCustomer = ["active", "paused"].includes(
            a["subscription.status"]
          )
          const isWaitlistedAdmissableUser =
            a["customer_admissions_data.admissable"] === "Yes" &&
            a["customer.status"] === "Waitlisted"
          return isActiveOrPausedCustomer || isWaitlistedAdmissableUser
        })

        const sanitizedValues = returnableValues.reduce((acc, curVal) => {
          const version = curVal["user_device_data.i_osversion"]

          // If this is not the first time we're seeing this version,
          // increment counts accordingly
          if (!acc[version]) {
            acc[version] = {}
          }

          // Initialize or increment values accordingly
          if (curVal["subscription.status"] === "active") {
            acc[version]["active"] =
              (acc[version]["active"] || 0) + curVal["customer.count"]
          } else if (curVal["subscription.status"] === "paused") {
            acc[version]["paused"] =
              (acc[version]["paused"] || 0) + curVal["customer.count"]
          } else if (
            curVal["customer.status"] === "Waitlisted" &&
            curVal["customer_admissions_data.admissable"] === "Yes"
          ) {
            acc[version]["admissable"] =
              (acc[version]["admissable"] || 0) + curVal["customer.count"]
          }

          return acc
        }, {})
        return sanitizedValues
      case "customer-retention":
        return val.map(a => ({
          cohort: a["subscription.created_month"],
          counts: a["customer.count"]["invoices.date_month"],
        }))
      default:
        return val?.[0]
    }
  }

  private extractMultiKeyCountsResult(result, labelKey, valueKey) {
    return result?.reduce((acc, curVal) => {
      acc[curVal[labelKey]] = curVal[valueKey]
      return acc
    }, {})
  }
}
