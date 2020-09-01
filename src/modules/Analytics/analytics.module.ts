import { Module } from "@nestjs/common"

import { AnalyticsMutationsResolver } from "./mutations/analytics.mutations"
import { AnalyticsService } from "./services/analytics.service"
import { LookerService } from "./services/looker.service"
import { SegmentService } from "./services/segment.service"

@Module({
  providers: [
    AnalyticsMutationsResolver,
    LookerService,
    AnalyticsService,
    SegmentService,
  ],
  exports: [SegmentService],
})
export class AnalyticsModule {}
