import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { UserModule } from "@modules/User/user.module"
import { PaymentUtilsService } from "./services/payment.utils.service"
import { PaymentMutationsResolver } from "./mutations/payment.mutations"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { PaymentService } from "./services/payment.service"
import { AirtableModule } from "@modules/Airtable/airtable.module"
import { EmailModule } from "@modules/Email/email.module"
import { ChargebeeMutationsResolver } from "./mutations/chargebee.mutations.resolver"
import { UtilsModule } from "@modules/Utils/utils.module"

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
