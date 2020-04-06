import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { AirtableModule } from "../Airtable/airtable.module"
import { ShippingModule } from "../Shipping/shipping.module"
import { MeFieldsResolver } from "./fields/me.fields"
import { AuthMutationsResolver } from "./mutations/auth.mutations"
import { CustomerMutationsResolver } from "./mutations/customer.mutations"
import { UserMutationsResolver } from "./mutations/user.mutations"
import { MeQueriesResolver } from "./queries/me.queries"
import { AuthService } from "./services/auth.service"
import { CustomerService } from "./services/customer.service"

@Module({
  imports: [AirtableModule, PrismaModule, ShippingModule],
  providers: [
    AuthService,
    CustomerService,
    MeFieldsResolver,
    MeQueriesResolver,
    AuthMutationsResolver,
    CustomerMutationsResolver,
    UserMutationsResolver,
  ],
  exports: [AuthService, CustomerService],
})
export class UserModule {}
