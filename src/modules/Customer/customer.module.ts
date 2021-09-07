import { UtilsModule } from "@modules/Utils/utils.module"
import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { PaymentPlanFieldsResolver } from "../Payment/fields/paymentPlan.fields.resolver"
import { BagItemFieldsResolver } from "./fields/bagItem.fields.resolvers"
import { CustomerFieldsResolver } from "./fields/customer.fields.resolver"
import { CustomerDetailFieldsResolver } from "./fields/customerDetail.fields.resolver"
import { CustomerMembershipFieldsResolver } from "./fields/customerMembership.fields.resolver"
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
    BagItemFieldsResolver,
    CustomerQueriesResolver,
    CustomerFieldsResolver,
    CustomerDetailFieldsResolver,
    PaymentPlanFieldsResolver,
    CustomerMembershipFieldsResolver,
  ],
}
@Module(CustomerModuleDef)
export class CustomerModule {}
