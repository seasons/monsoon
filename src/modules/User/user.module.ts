import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { AirtableModule } from "../Airtable/airtable.module"
import { PushNotificationsModule } from "../PushNotification/pushNotifications.module"
import { ShippingModule } from "../Shipping/shipping.module"
import { MeFieldsResolver } from "./fields/me.fields"
import { UserFieldsResolver } from "./fields/user.fields"
import { AuthMutationsResolver } from "./mutations/auth.mutations"
import { CustomerMutationsResolver } from "./mutations/customer.mutations"
import { UserMutationsResolver } from "./mutations/user.mutations"
import { MeQueriesResolver } from "./queries/me.queries"
import { UserQueriesResolver } from "./queries/user.queries.resolver"
import { AuthService } from "./services/auth.service"
import { CustomerService } from "./services/customer.service"

@Module({
  imports: [
    AirtableModule,
    PrismaModule,
    ShippingModule,
    PushNotificationsModule,
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
  ],
  exports: [AuthService, CustomerService],
})
export class UserModule {}
