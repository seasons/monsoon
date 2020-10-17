import { Module } from "@nestjs/common"
import { APP_FILTER } from "@nestjs/core"

import { SentryFilter } from "./filters/sentry.filter"
import { ErrorService } from "./services/error.service"

@Module({
  providers: [
    ErrorService,
    {
      provide: APP_FILTER,
      useClass: SentryFilter,
    },
  ],
  exports: [ErrorService],
})
export class ErrorModule {}
