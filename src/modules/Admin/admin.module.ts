import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { ActiveAdminInterceptor } from "./interceptors/ActiveAdminInterceptor"

@Module({
  imports: [PrismaModule, AnalyticsModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActiveAdminInterceptor,
    },
  ],
})
export class AdminModule {}
