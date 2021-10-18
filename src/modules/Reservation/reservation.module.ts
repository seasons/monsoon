import { ImageModule } from "@modules/Image/image.module"
import { PaymentModule } from "@modules/Payment/payment.module"
import { PushNotificationModule } from "@modules/PushNotification/pushNotification.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { UserModule } from "@modules/User/user.module"
import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { EmailModule } from "../Email/email.module"
import { ErrorModule } from "../Error/error.module"
import { ProductModule } from "../Product/product.module"
import { ReservationFeedbackMutationsResolver } from "../Reservation/mutations/reservationFeedback.mutations.resolver"
import { ReservationFeedbackQueriesResolver } from "../Reservation/queries/reservationFeedback.queries.resolver"
import { UtilsModule } from "../Utils/utils.module"
import { ReservationFieldsResolver } from "./fields/reservation.fields.resolver"
import { ReservationMutationsResolver } from "./mutations/reservation.mutations.resolver"
import { ReservationQueriesResolver } from "./queries/reservation.queries.resolver"
import { ReservationService } from "./services/reservation.service"
import { ReservationUtilsService } from "./services/reservation.utils.service"
import { ReservationFeedbackService } from "./services/reservationFeedback.service"
import { ReserveService } from "./services/reserve.service"

@Module({
  imports: [
    EmailModule,
    ImageModule,
    PrismaModule,
    forwardRef(() => ProductModule),
    PushNotificationModule,
    ShippingModule,
    forwardRef(() => PaymentModule),
    AnalyticsModule,
    UtilsModule,
    ErrorModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    ReservationFeedbackMutationsResolver,
    ReservationFeedbackQueriesResolver,
    ReservationFeedbackService,
    ReservationFieldsResolver,
    ReservationQueriesResolver,
    ReservationUtilsService,
    ReservationService,
    ReserveService,
    ReservationMutationsResolver,
  ],
  exports: [ReservationService, ReservationUtilsService],
})
export class ReservationModule {}
