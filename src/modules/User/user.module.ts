import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { EmailModule } from "../Email/email.module"
import { PushNotificationModule } from "../PushNotification/pushNotification.module"
import { ShippingModule } from "../Shipping/shipping.module"
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

@Module({
  imports: [
    EmailModule,
    PrismaModule,
    ShippingModule,
    PushNotificationModule,
    ShippingModule,
    UtilsModule,
    AnalyticsModule,
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
  ],
  exports: [AuthService, CustomerService],
})
export class UserModule {}
