import { CustomerUtilsService } from "@app/modules/User/services/customer.utils.service"
import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { DripModule } from "../Drip/drip.module"
import { EmailModule } from "../Email/email.module"
import { ErrorModule } from "../Error/error.module"
import { PaymentModule } from "../Payment/payment.module"
import { PushNotificationModule } from "../PushNotification/pushNotification.module"
import { ReservationModule } from "../Reservation/reservation.module"
import { ShippingModule } from "../Shipping/shipping.module"
import { SMSModule } from "../SMS/sms.module"
import { UtilsModule } from "../Utils/utils.module"
import { MeFieldsResolver } from "./fields/me.fields"
import { UserFieldsResolver } from "./fields/user.fields"
import { AuthMutationsResolver } from "./mutations/auth.mutations"
import { CustomerMutationsResolver } from "./mutations/customer.mutations"
import { UserMutationsResolver } from "./mutations/user.mutations"
import { MeQueriesResolver } from "./queries/me.queries"
import { UserQueriesResolver } from "./queries/user.queries.resolver"
import { AdmissionsService } from "./services/admissions.service"
import { AuthService } from "./services/auth.service"
import { CustomerService } from "./services/customer.service"

export const USER_MODULE_DEF = {
  imports: [
    EmailModule,
    PrismaModule,
    ShippingModule,
    PushNotificationModule,
    ShippingModule,
    UtilsModule,
    AnalyticsModule,
    SMSModule,
    ErrorModule,
    DripModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => ReservationModule),
  ],
  providers: [
    AuthService,
    CustomerService,
    MeFieldsResolver,
    MeQueriesResolver,
    AuthMutationsResolver,
    CustomerMutationsResolver,
    UserMutationsResolver,
    UserQueriesResolver,
    UserFieldsResolver,
    AdmissionsService,
    CustomerUtilsService,
  ],
  exports: [
    AuthService,
    CustomerService,
    AdmissionsService,
    CustomerUtilsService,
  ],
}
@Module(USER_MODULE_DEF)
export class UserModule {}
