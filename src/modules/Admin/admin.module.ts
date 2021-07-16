import { AnalyticsModule } from "@modules/Analytics/analytics.module"
import { PrismaModule } from "@modules/Prisma/prisma.module"
import { Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"

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
