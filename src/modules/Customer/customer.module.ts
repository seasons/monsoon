import { PaymentModule } from "@modules/Payment/payment.module"
import { ReservationModule } from "@modules/Reservation/reservation.module"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module, forwardRef } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { PaymentPlanFieldsResolver } from "../Payment/fields/paymentPlan.fields.resolver"
import { ProductModule } from "../Product/product.module"
import { BagItemFieldsResolver } from "./fields/bagItem.fields.resolvers"
import { CustomerFieldsResolver } from "./fields/customer.fields.resolver"
import { CustomerDetailFieldsResolver } from "./fields/customerDetail.fields.resolver"
import { CustomerMembershipFieldsResolver } from "./fields/customerMembership.fields.resolver"
import { CustomerQueriesResolver } from "./queries/customer.queries.resolver"

export const CustomerModuleDef = {
  imports: [
    PrismaModule,
    ReservationModule,
    UtilsModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => UserModule),
    ProductModule,
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
