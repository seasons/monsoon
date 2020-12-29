import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { PaymentUtilsService } from "./services/paymentUtils.service"
import { TestUtilsService } from "./services/test.service"
import { UtilsService } from "./services/utils.service"

@Module({
  imports: [PrismaModule],
  providers: [UtilsService, TestUtilsService, PaymentUtilsService],
  exports: [UtilsService, TestUtilsService, PaymentUtilsService],
})
export class UtilsModule {}
