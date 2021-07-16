import { AnalyticsModule } from "@modules/Analytics/analytics.module"
import { DripModule } from "@modules/Drip/drip.module"
import { EmailModule } from "@modules/Email/email.module"
import { ErrorModule } from "@modules/Error/error.module"
import { PaymentModule } from "@modules/Payment/payment.module"
import { PrismaModule } from "@modules/Prisma/prisma.module"
import { PushNotificationModule } from "@modules/PushNotification/pushNotification.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { SMSModule } from "@modules/SMS/sms.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module, forwardRef } from "@nestjs/common"

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
import { CustomerUtilsService } from "./services/customer.utils.service"

@Module({
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
    forwardRef(() => PaymentModule),
    DripModule,
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
})
export class UserModule {}
