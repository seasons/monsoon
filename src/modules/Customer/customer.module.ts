import { PrismaModule } from "@modules/Prisma/prisma.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module, forwardRef } from "@nestjs/common"

import { PaymentPlanFieldsResolver } from "../Payment/fields/paymentPlan.fields.resolver"
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
