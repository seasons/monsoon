import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { AuthMutationsResolver } from "./mutations/auth.mutations"
import { AuthService } from "./services/auth.service"
import { MeQueriesResolver } from "./queries/me.queries"
import { MeFieldsResolver } from "./fields/me.fields"
import { CustomerService } from "./services/customer.service"
import { CustomerMutationsResolver } from "./mutations/customer.mutations"
import { AirtableModule } from "../Airtable/airtable.module"

@Module({
  imports: [AirtableModule, PrismaModule],
  providers: [
    AuthService,
    CustomerService,
    MeFieldsResolver,
    MeQueriesResolver,
    AuthMutationsResolver,
    CustomerMutationsResolver
  ],
  exports: [AuthService],
})
export class UserModule {}
