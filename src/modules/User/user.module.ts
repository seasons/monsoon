import { AirtableModule } from "../Airtable/airtable.module"
import { AuthMutationsResolver } from "./mutations/auth.mutations"
import { AuthService } from "./services/auth.service"
import { CustomerMutationsResolver } from "./mutations/customer.mutations"
import { CustomerService } from "./services/customer.service"
import { MeFieldsResolver } from "./fields/me.fields"
import { MeQueriesResolver } from "./queries/me.queries"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { ShippingModule } from "../Shipping/shipping.module"
import { UserMutationsResolver } from "./mutations/user.mutations"
import { UserQueriesResolver } from "./queries/user.queries.resolver"

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
    UserQueriesResolver,
  ],
  exports: [AuthService, CustomerService],
})
export class UserModule {}
