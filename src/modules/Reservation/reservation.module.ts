import { AirtableModule } from "@modules/Airtable"
import { EmailModule } from "@modules/Email"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { ProductModule } from "@modules/Product"
import { UtilsModule } from "@modules/Utils"
import { ShippingModule } from "@modules/Shipping/shipping.module"

import { ReservationFeedbackMutationsResolver } from "../Reservation/mutations/reservationFeedback.mutations.resolver"
import { ReservationFeedbackQueriesResolver } from "../Reservation/queries/reservationFeedback.queries.resolver"
import { ReservationFeedbackService } from "./services/reservationFeedback.service"
import { ReservationFieldsResolver } from "./fields/reservation.fields.resolver"
import { ReservationMutationsResolver } from "./mutations/reservation.mutations.resolver"
import { ReservationQueriesResolver } from "./queries/reservation.queries.resolver"
import { ReservationService } from "./services/reservation.service"
import { ReservationUtilsService } from "./services/reservation.utils.service"

@Module({
  imports: [
    AirtableModule,
    EmailModule,
    PrismaModule,
    ProductModule,
    ShippingModule,
    UtilsModule,
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
