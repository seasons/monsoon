import { ReservationModule } from "@modules/Reservation/reservation.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { UtilsModule } from "../Utils/utils.module"
import { TestUtilsService } from "./services/test.service"

@Module({
  imports: [PrismaModule, ReservationModule, UtilsModule],
  providers: [TestUtilsService],
  exports: [TestUtilsService],
})
export class TestModule {}
