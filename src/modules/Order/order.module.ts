import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { ErrorModule } from "../Error/error.module"
import { ProductModule } from "../Product/product.module"
import { ShopifyModule } from "../Shopify/shopify.module"
import { OrderItemFieldsResolver } from "./fields/orderItem.fields.resolver"
import { OrderMutationsResolver } from "./mutations/order.mutations.resolver"

@Module({
  imports: [PrismaModule, ProductModule, ShopifyModule, ErrorModule],
  providers: [OrderMutationsResolver, OrderItemFieldsResolver],
  exports: [],
})
export class OrderModule {}
