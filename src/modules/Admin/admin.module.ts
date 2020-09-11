import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { ActiveAdminInterceptor } from "./interceptors/ActiveAdminInterceptor"
import { InterpretLogsService } from "./services/interpretLogs.service"

@Module({
  imports: [PrismaModule, AnalyticsModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActiveAdminInterceptor,
    },
    InterpretLogsService,
  ],
  exports: [InterpretLogsService],
})
export class AdminModule {}
