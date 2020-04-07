import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { ReservationFieldsResolver } from "./fields/reservation.fields.resolver"
import { ReservationUtilsService } from "./services/reservation.utils.service"

@Module({
  imports: [PrismaModule],
  providers: [ReservationFieldsResolver, ReservationUtilsService],
})
export class ReservationModule {}
