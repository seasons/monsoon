import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { CustomerFieldsResolver } from "./fields/customer.fields.resolver"
import { CustomerQueriesResolver } from "./queries/customer.queries.resolver"
import { PaymentModule } from ".."

@Module({
  imports: [PrismaModule, PaymentModule],
  providers: [CustomerQueriesResolver, CustomerFieldsResolver],
})
export class CustomerModule {}
