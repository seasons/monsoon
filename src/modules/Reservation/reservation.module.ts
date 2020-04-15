import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { ReservationFieldsResolver } from "./fields/reservation.fields.resolver"
import { ReservationQueriesResolver } from "./queries/reservation.queries.resolver"
import { ReservationFeedbackMutationsResolver } from "../Reservation/mutations/reservationFeedback.mutations.resolver"
import { ReservationFeedbackQueriesResolver } from "../Reservation/queries/reservationFeedback.queries.resolver"
import { ReservationFeedbackService } from "./services/reservationFeedback.service"
import { ReservationService } from "./services/reservation.service"
import { ReservationUtilsService } from "./services/reservation.utils.service"
import { ProductModule } from "@modules/Product"
import { ReservationMutationsResolver } from "./mutations/reservation.mutations.resolver"
import { AirtableModule } from "@modules/Airtable"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { EmailModule } from "@modules/Email"

@Module({
  imports: [
    AirtableModule,
    EmailModule,
    PrismaModule,
    ProductModule,
    ShippingModule,
  ],
  providers: [
    ReservationFeedbackMutationsResolver,
    ReservationFeedbackQueriesResolver,
    ReservationFeedbackService,
    ReservationFieldsResolver,
    ReservationQueriesResolver,
    ReservationUtilsService,
    ReservationService,
    ReservationMutationsResolver,
  ],
})
export class ReservationModule {}
