import { Module } from "@nestjs/common"

import { PrismaModule } from "../../prisma/prisma.module"
import { ErrorModule } from "../Error/error.module"
import { ImageModule } from "../Image/image.module"
import { ReservationModule } from "../Reservation/reservation.module"
import { UtilsModule } from "../Utils/utils.module"
import { EmailService } from "./services/email.service"
import { EmailUtilsService } from "./services/email.utils.service"

@Module({
  imports: [
    PrismaModule,
    UtilsModule,
    ErrorModule,
    ImageModule,
    ReservationModule,
  ],
  providers: [EmailService, EmailUtilsService],
  exports: [EmailService],
})
export class EmailModule {}
