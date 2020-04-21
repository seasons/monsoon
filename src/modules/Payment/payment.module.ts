import { Module, forwardRef } from "@nestjs/common"

import { AirtableModule } from "@modules/Airtable/airtable.module"
import { ChargebeeMutationsResolver } from "./mutations/chargebee.mutations.resolver"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { DataLoaderModule } from "@app/modules/DataLoader/dataloader.module"
import { EmailModule } from "@modules/Email/email.module"
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
    DataLoaderModule,
  ],
  providers: [
    ChargebeeMutationsResolver,
    ChargebeeQueriesResolver,
    PaymentMutationsResolver,
    PaymentService,
    PaymentUtilsService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
