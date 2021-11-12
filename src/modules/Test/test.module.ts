import { ReservationModule } from "@modules/Reservation/reservation.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { ReserveService } from "../Reservation/services/reserve.service"
import { UtilsModule } from "../Utils/utils.module"
import { TestUtilsService } from "./services/test.service"

@Module({
  imports: [PrismaModule, ReservationModule, UtilsModule, ReserveService],
  providers: [TestUtilsService],
  exports: [TestUtilsService],
})
export class TestModule {}
