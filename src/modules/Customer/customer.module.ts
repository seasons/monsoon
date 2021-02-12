import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { CustomerFieldsResolver } from "./fields/customer.fields.resolver"
import { CustomerDetailFieldsResolver } from "./fields/customerDetail.fields.resolver"
import { PaymentPlanFieldsResolver } from "./fields/paymentPlan.fields.resolver"
import { CustomerQueriesResolver } from "./queries/customer.queries.resolver"
import { PaymentModule } from ".."

export const CustomerModuleDef = {
  imports: [PrismaModule, forwardRef(() => PaymentModule)],
  providers: [
    CustomerQueriesResolver,
    CustomerFieldsResolver,
    CustomerDetailFieldsResolver,
    PaymentPlanFieldsResolver,
  ],
}
@Module(CustomerModuleDef)
export class CustomerModule {}
