import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { UserModule } from "../User/user.module"
import { PaymentUtilsService } from "./services/payment.utils.service"
import { PaymentMutationsResolver } from "./mutations/payment.mutations"
import { ShippingModule } from "../Shipping/shipping.module"
import { PaymentService } from "./services/payment.service"
import { AirtableModule } from "../Airtable/airtable.module"
import { EmailModule } from "../Email/email.module"
import { ChargebeeMutationsResolver } from "./mutations/chargebee.mutations.resolver"
import { UtilsModule } from "../Utils/utils.module"

@Module({
  imports: [
    AirtableModule,
    EmailModule,
    UserModule,
    PrismaModule,
    ShippingModule,
    UtilsModule,
  ],
  providers: [
    ChargebeeMutationsResolver,
    ChargebeeQueriesResolver,
    PaymentMutationsResolver,
    PaymentService,
    PaymentUtilsService,
  ],
})
export class PaymentModule {}
