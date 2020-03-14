import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { UserModule } from "../User/user.module"
import { PaymentService } from "./services/payment.services"
import { PaymentUtilsService } from "./services/payment.utils.service"
import { PaymentMutationsResolver } from "./mutations/payment.mutations"
import { ShippingModule } from "../Shipping/shipping.module"

@Module({
  imports: [
    UserModule,
    PrismaModule,
    ShippingModule
  ],
  providers: [
    ChargebeeQueriesResolver,
    PaymentMutationsResolver,
    PaymentService,
    PaymentUtilsService,
  ],
})
export class PaymentModule {}
