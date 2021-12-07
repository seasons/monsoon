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
import { TestModule } from "../Test/test.module"
import { UtilsModule } from "../Utils/utils.module"
import { ReservationFieldsResolver } from "./fields/reservation.fields.resolver"
import { ReservationMutationsResolver } from "./mutations/reservation.mutations.resolver"
import { ReservationPhysicalProductMutationsResolver } from "./mutations/reservationPhysicalProduct.mutations.resolver"
import { ReservationQueriesResolver } from "./queries/reservation.queries.resolver"
import { ReservationService } from "./services/reservation.service"
import { ReservationFeedbackService } from "./services/reservationFeedback.service"
import { ReservationPhysicalProductService } from "./services/reservationPhysicalProduct.service"
import { ReserveService } from "./services/reserve.service"
import { ReservationTestUtilsService } from "./tests/reservation.test.utils"

export const ReservationModuleRef = {
  imports: [
    forwardRef(() => EmailModule),
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
    forwardRef(() => TestModule),
  ],
  providers: [
    ReservationPhysicalProductMutationsResolver,
    ReservationFeedbackMutationsResolver,
    ReservationFeedbackQueriesResolver,
    ReservationFeedbackService,
    ReservationFieldsResolver,
    ReservationQueriesResolver,
    ReservationService,
    ReserveService,
    ReservationMutationsResolver,
    ReservationPhysicalProductService,
    ReservationTestUtilsService,
  ],
  exports: [ReservationService, ReserveService, ReservationTestUtilsService],
}

@Module(ReservationModuleRef)
export class ReservationModule {}
