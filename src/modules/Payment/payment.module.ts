import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { UserModule } from "../User/user.module"
import { PaymentService } from "./services/payment.service"
import { AirtableModule } from "../Airtable/airtable.module"
import { EmailModule } from "../Email/email.module"
import { ChargebeeMutationsResolver } from "./mutations/chargebee.mutations.resolver"

@Module({
  imports: [
    AirtableModule,
    EmailModule,
    UserModule,
    PrismaModule,
  ],
  providers: [
    ChargebeeMutationsResolver,
    ChargebeeQueriesResolver,
    PaymentService,
  ],
})
export class PaymentModule {}
