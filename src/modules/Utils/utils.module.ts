import { AnalyticsModule } from "@modules/Analytics/analytics.module"
import { PrismaModule } from "@modules/Prisma/prisma.module"
import { Module } from "@nestjs/common"

import { PaymentUtilsService } from "./services/paymentUtils.service"
import { QueryUtilsService } from "./services/queryUtils.service"
import { StatementsService } from "./services/statements.service"
import { TestUtilsService } from "./services/test.service"
import { UtilsService } from "./services/utils.service"

@Module({
  imports: [PrismaModule, AnalyticsModule],
  providers: [
    UtilsService,
    TestUtilsService,
    PaymentUtilsService,
    StatementsService,
    QueryUtilsService,
  ],
  exports: [
    UtilsService,
    TestUtilsService,
    PaymentUtilsService,
    StatementsService,
    QueryUtilsService,
  ],
})
export class UtilsModule {}
