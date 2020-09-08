import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"

import { ActiveAdminInterceptor } from "./interceptors/ActiveAdminInterceptor"

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ActiveAdminInterceptor,
    },
  ],
})
export class AdminModule {}
