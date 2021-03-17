import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { SegmentController } from "./controllers/segment.controller"
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
  controllers: [SegmentController],
  imports: [PrismaModule],
  exports: [SegmentService],
})
export class AnalyticsModule {}
