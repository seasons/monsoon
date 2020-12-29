import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { PaymentUtilsService } from "./services/paymentUtils.service"
import { TestUtilsService } from "./services/test.service"
import { UtilsService } from "./services/utils.service"

@Module({
  imports: [PrismaModule, AnalyticsModule],
  providers: [UtilsService, TestUtilsService, PaymentUtilsService],
  exports: [UtilsService, TestUtilsService, PaymentUtilsService],
})
export class UtilsModule {}
