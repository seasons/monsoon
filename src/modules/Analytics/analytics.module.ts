import { Module } from "@nestjs/common"

import { AnalyticsMutationsResolver } from "./mutations/analytics.mutations"
import { AnalyticsService } from "./services/analytics.service"
import { LookerService } from "./services/looker.service"

@Module({
  providers: [AnalyticsMutationsResolver, LookerService, AnalyticsService],
})
export class AnalyticsModule {}
