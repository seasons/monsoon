import { AirtableModule } from "@modules/Airtable/airtable.module"
import { EmailModule } from "@modules/Email/email.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { InvoicesForCustomersLoader } from "./loaders/invoicesForCustomers.loaders"
import { TransactionsLoader } from "./loaders/transactions.loaders"
import { TransactionsForCustomersLoader } from "./loaders/transactionsForCustomers.loader"
import { ChargebeeMutationsResolver } from "./mutations/chargebee.mutations.resolver"
import { PaymentMutationsResolver } from "./mutations/payment.mutations"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { PaymentQueriesResolver } from "./queries/payment.queries.resolver"
import { LoaderUtilsService } from "./services/loader.utils.service"
import { PaymentService } from "./services/payment.service"
import { PaymentUtilsService } from "./services/payment.utils.service"

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
    PaymentQueriesResolver,
    PaymentMutationsResolver,
    PaymentService,
    PaymentUtilsService,
    InvoicesForCustomersLoader,
    TransactionsLoader,
    TransactionsForCustomersLoader,
    LoaderUtilsService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
