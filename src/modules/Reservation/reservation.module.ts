import { AirtableModule } from "@modules/Airtable"
import { EmailModule } from "@modules/Email"
import { ImageModule } from "@modules/Image"
import { ProductModule } from "@modules/Product"
import { PushNotificationModule } from "@modules/PushNotification"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { ReservationFeedbackMutationsResolver } from "../Reservation/mutations/reservationFeedback.mutations.resolver"
import { ReservationFeedbackQueriesResolver } from "../Reservation/queries/reservationFeedback.queries.resolver"
import { ReservationFieldsResolver } from "./fields/reservation.fields.resolver"
import { ReservationMutationsResolver } from "./mutations/reservation.mutations.resolver"
import { ReservationQueriesResolver } from "./queries/reservation.queries.resolver"
import { ReservationService } from "./services/reservation.service"
import { ReservationUtilsService } from "./services/reservation.utils.service"
import { ReservationFeedbackService } from "./services/reservationFeedback.service"

@Module({
  imports: [
    AirtableModule,
    EmailModule,
    ImageModule,
    PrismaModule,
    ProductModule,
    PushNotificationModule,
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
  exports: [ReservationService],
})
export class ReservationModule {}
