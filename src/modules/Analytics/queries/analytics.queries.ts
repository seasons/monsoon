import { Args, Info, Query, Resolver } from "@nestjs/graphql"

import { AnalyticsService } from "../services/analytics.service"
import { LookerService } from "../services/looker.service"

@Resolver()
export class AnalyticsQueriesResolver {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly looker: LookerService
  ) {}

  @Query()
  async dashboard(@Args() { id }, @Info() info) {
    switch (id) {
      case "global":
        return {
          id: "global",
          name: "Global Metrics",
          elements: await this.looker.getGlobalMetricsDashboard(),
        }
      default:
        throw new Error("Dashboard id not found")
    }
  }
}
