import { AirtableModule } from "@modules/Airtable/airtable.module"
import { ChargebeeMutationsResolver } from "./mutations/chargebee.mutations.resolver"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { EmailModule } from "@modules/Email/email.module"
import { Module } from "@nestjs/common"
import { PaymentMutationsResolver } from "./mutations/payment.mutations"
import { PaymentService } from "./services/payment.service"
import { PaymentUtilsService } from "./services/payment.utils.service"
import { PrismaModule } from "@prisma/prisma.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { UserModule } from "@modules/User/user.module"
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
