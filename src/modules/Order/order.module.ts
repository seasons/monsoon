import { ErrorModule } from "@modules/Error/error.module"
import { ProductModule } from "@modules/Product/product.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { ShopifyModule } from "@modules/Shopify/shopify.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { EmailModule } from "../Email/email.module"
import { OrderFieldsResolver } from "./fields/order.fields.resolver"
import { OrderLineItemFieldsResolver } from "./fields/orderLineItem.fields.resolver"
import { OrderMutationsResolver } from "./mutations/order.mutations.resolver"
import { OrderService } from "./services/order.service"

@Module({
  imports: [
    PrismaModule,
    ProductModule,
    ShopifyModule,
    ErrorModule,
    ShippingModule,
    EmailModule,
    AnalyticsModule,
  ],
  providers: [
    OrderMutationsResolver,
    OrderLineItemFieldsResolver,
    OrderFieldsResolver,
    OrderService,
  ],
  exports: [OrderService],
})
export class OrderModule {}
