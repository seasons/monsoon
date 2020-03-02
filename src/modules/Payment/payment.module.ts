import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { ChargebeeQueriesResolver } from "./queries/chargebee.queries.resolver"
import { UserModule } from "../User/user.module"

@Module({
  imports: [
    UserModule,
    PrismaModule,
  ],
  providers: [ChargebeeQueriesResolver],
})
export class PaymentModule {}
