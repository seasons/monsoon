import { AnalyticsModule } from "@modules/Analytics/analytics.module"
import { EmailModule } from "@modules/Email/email.module"
import { ErrorModule } from "@modules/Error/error.module"
import { PrismaModule } from "@modules/Prisma/prisma.module"
import { ProductModule } from "@modules/Product/product.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { ShopifyModule } from "@modules/Shopify/shopify.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"

import { OrderFieldsResolver } from "./fields/order.fields.resolver"
import { OrderLineItemFieldsResolver } from "./fields/orderLineItem.fields.resolver"
import { OrderMutationsResolver } from "./mutations/order.mutations.resolver"
import { OrderQueriesResolver } from "./queries/order.queries.resolver"
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
    UtilsModule,
  ],
  providers: [
    OrderQueriesResolver,
    OrderMutationsResolver,
    OrderLineItemFieldsResolver,
    OrderFieldsResolver,
    OrderService,
  ],
  exports: [OrderService],
})
export class OrderModule {}
