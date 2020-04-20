import { CustomerQueriesResolver } from "./queries/customer.queries.resolver"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { CustomerFieldsResolver } from "./fields/customer.fields.resolver"
import { PaymentModule } from ".."

@Module({
  imports: [PrismaModule, PaymentModule],
  providers: [CustomerQueriesResolver, CustomerFieldsResolver],
})
export class CustomerModule {}
