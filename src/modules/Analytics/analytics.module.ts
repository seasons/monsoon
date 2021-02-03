import { Module } from "@nestjs/common"

import { AnalyticsMutationsResolver } from "./mutations/analytics.mutations"
import { AnalyticsQueriesResolver } from "./queries/analytics.queries"
import { AnalyticsService } from "./services/analytics.service"
import { LookerService } from "./services/looker.service"
import { SegmentService } from "./services/segment.service"

@Module({
  providers: [
    AnalyticsQueriesResolver,
    AnalyticsMutationsResolver,
    LookerService,
    AnalyticsService,
    SegmentService,
  ],
  exports: [SegmentService],
})
export class AnalyticsModule {}
