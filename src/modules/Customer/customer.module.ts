import { CustomerFieldsResolver } from "./fields/customer.fields.resolver"
import { CustomerQueriesResolver } from "./queries/customer.queries.resolver"
import { Module } from "@nestjs/common"
import { PaymentModule } from ".."
import { PrismaModule } from "@prisma/prisma.module"

@Module({
  imports: [PrismaModule, PaymentModule],
  providers: [CustomerQueriesResolver, CustomerFieldsResolver],
})
export class CustomerModule {}
