import { ImageModule } from "@modules/Image/image.module"
import { PaymentModule } from "@modules/Payment/payment.module"
import { ProductModule } from "@modules/Product"
import { PushNotificationModule } from "@modules/PushNotification"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { EmailModule } from "../Email/email.module"
import { ErrorModule } from "../Error/error.module"
import { ReservationFeedbackMutationsResolver } from "../Reservation/mutations/reservationFeedback.mutations.resolver"
import { ReservationFeedbackQueriesResolver } from "../Reservation/queries/reservationFeedback.queries.resolver"
import { UtilsModule } from "../Utils/utils.module"
import { ReservationFieldsResolver } from "./fields/reservation.fields.resolver"
import { ReservationMutationsResolver } from "./mutations/reservation.mutations.resolver"
import { ReservationQueriesResolver } from "./queries/reservation.queries.resolver"
import { ReservationService } from "./services/reservation.service"
import { ReservationUtilsService } from "./services/reservation.utils.service"
import { ReservationFeedbackService } from "./services/reservationFeedback.service"

@Module({
  imports: [
    EmailModule,
    ImageModule,
    PrismaModule,
    ProductModule,
    PushNotificationModule,
    ShippingModule,
    PaymentModule,
    AnalyticsModule,
    UtilsModule,
    ErrorModule,
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
