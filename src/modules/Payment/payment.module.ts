import { AnalyticsModule } from "@modules/Analytics/analytics.module"
import { EmailModule } from "@modules/Email/email.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { ErrorModule } from "../Error/error.module"
import { ChargebeeController } from "./controllers/chargebee.controller"
import { InvoicesForCustomersLoader } from "./loaders/invoicesForCustomers.loaders"
import { TransactionsLoader } from "./loaders/transactions.loaders"
import { TransactionsForCustomersLoader } from "./loaders/transactionsForCustomers.loader"
import { PaymentMutationsResolver } from "./mutations/payment.mutations"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { PaymentQueriesResolver } from "./queries/payment.queries.resolver"
import { LoaderUtilsService } from "./services/loader.utils.service"
import { PaymentService } from "./services/payment.service"

@Module({
  controllers: [ChargebeeController],
  imports: [
    EmailModule,
    PrismaModule,
    ShippingModule,
    forwardRef(() => UserModule),
    UtilsModule,
    AnalyticsModule,
    ErrorModule,
  ],
  providers: [
    ChargebeeQueriesResolver,
    InvoicesForCustomersLoader,
    LoaderUtilsService,
    PaymentQueriesResolver,
    PaymentMutationsResolver,
    PaymentService,
    TransactionsLoader,
    TransactionsForCustomersLoader,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
