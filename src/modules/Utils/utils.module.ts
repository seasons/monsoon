import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { PaymentUtilsService } from "./services/paymentUtils.service"
import { ProductUtilsService } from "./services/product.utils.service"
import { QueryUtilsService } from "./services/queryUtils.service"
import { ReservationUtilsService } from "./services/reservation.utils.service"
import { StatementsService } from "./services/statements.service"
import { TimeUtilsService } from "./services/time.service"
import { UtilsService } from "./services/utils.service"

@Module({
  imports: [PrismaModule, AnalyticsModule],
  providers: [
    UtilsService,
    PaymentUtilsService,
    StatementsService,
    QueryUtilsService,
    TimeUtilsService,
    ProductUtilsService,
    ReservationUtilsService,
  ],
  exports: [
    ProductUtilsService,
    UtilsService,
    PaymentUtilsService,
    StatementsService,
    QueryUtilsService,
    TimeUtilsService,
    ReservationUtilsService,
  ],
})
export class UtilsModule {}
