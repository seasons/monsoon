import { CustomerFieldsResolver } from "./fields/customer.fields.resolver"
import { CustomerQueriesResolver } from "./queries/customer.queries.resolver"
import { Module, forwardRef } from "@nestjs/common"
import { PaymentModule } from ".."
import { PrismaModule } from "@prisma/prisma.module"

@Module({
  imports: [PrismaModule, forwardRef(() => PaymentModule)],
  providers: [CustomerQueriesResolver, CustomerFieldsResolver],
})
export class CustomerModule {}
