import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { PaymentUtilsService } from "./services/paymentUtils.service"
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
  ],
  exports: [
    UtilsService,
    TestUtilsService,
    PaymentUtilsService,
    StatementsService,
  ],
})
export class UtilsModule {}
