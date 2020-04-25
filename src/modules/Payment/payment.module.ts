import { AirtableModule } from "@modules/Airtable/airtable.module"
import { ChargebeeMutationsResolver } from "./mutations/chargebee.mutations.resolver"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { EmailModule } from "@modules/Email/email.module"
import { InvoicesForCustomersLoader } from "./loaders/invoicesForCustomers.loaders"
import { LoaderUtilsService } from "./services/loader.utils.service"
import { Module } from "@nestjs/common"
import { PaymentMutationsResolver } from "./mutations/payment.mutations"
import { PaymentService } from "./services/payment.service"
import { PaymentUtilsService } from "./services/payment.utils.service"
import { PrismaModule } from "@prisma/prisma.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { TransactionsForCustomersLoader } from "./loaders/transactionsForCustomers.loader"
import { TransactionsLoader } from "./loaders/transactions.loaders"
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
    InvoicesForCustomersLoader,
    TransactionsLoader,
    TransactionsForCustomersLoader,
    LoaderUtilsService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
