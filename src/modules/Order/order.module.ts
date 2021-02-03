import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { ProductModule } from "../Product/product.module"
import { ShopifyModule } from "../Shopify/shopify.module"
import { OrderMutationsResolver } from "./mutations/order.mutations"

@Module({
  imports: [PrismaModule, ProductModule, ShopifyModule],
  providers: [OrderMutationsResolver],
  exports: [],
})
export class OrderModule {}
