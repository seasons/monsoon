import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { PaymentPlanFieldsResolver } from "../Payment/fields/paymentPlan.fields.resolver"
import { UtilsModule } from "../Utils/utils.module"
import { CustomerFieldsResolver } from "./fields/customer.fields.resolver"
import { CustomerDetailFieldsResolver } from "./fields/customerDetail.fields.resolver"
import { CustomerQueriesResolver } from "./queries/customer.queries.resolver"
import { PaymentModule, ReservationModule } from ".."

export const CustomerModuleDef = {
  imports: [
    PrismaModule,
    forwardRef(() => PaymentModule),
    ReservationModule,
    UtilsModule,
  ],
  providers: [
    CustomerQueriesResolver,
    CustomerFieldsResolver,
    CustomerDetailFieldsResolver,
    PaymentPlanFieldsResolver,
  ],
}
@Module(CustomerModuleDef)
export class CustomerModule {}
