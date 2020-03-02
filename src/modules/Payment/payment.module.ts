import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { UserModule } from "../User/user.module"
import { PaymentService } from "./services/payment.services"

@Module({
  imports: [
    UserModule,
    PrismaModule,
  ],
  providers: [
    ChargebeeQueriesResolver,
    PaymentService,
  ],
})
export class PaymentModule {}
