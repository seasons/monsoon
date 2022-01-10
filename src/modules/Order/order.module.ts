import { ErrorModule } from "@modules/Error/error.module"
import { ProductModule } from "@modules/Product/product.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { ShopifyModule } from "@modules/Shopify/shopify.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { EmailModule } from "../Email/email.module"
import { PaymentModule } from "../Payment/payment.module"
import { UtilsModule } from "../Utils/utils.module"
import { OrderFieldsResolver } from "./fields/order.fields.resolver"
import { OrderLineItemFieldsResolver } from "./fields/orderLineItem.fields.resolver"
import { OrderMutationsResolver } from "./mutations/order.mutations.resolver"
import { OrderQueriesResolver } from "./queries/order.queries.resolver"
import { OrderService } from "./services/order.service"

export const ORDER_MODULE_DEF = {
  imports: [
    PrismaModule,
    ProductModule,
    ShopifyModule,
    ErrorModule,
    ShippingModule,
    EmailModule,
    AnalyticsModule,
    UtilsModule,
    PaymentModule,
  ],
  providers: [
    OrderQueriesResolver,
    OrderMutationsResolver,
    OrderLineItemFieldsResolver,
    OrderFieldsResolver,
    OrderService,
  ],
  exports: [OrderService],
}
@Module(ORDER_MODULE_DEF)
export class OrderModule {}
