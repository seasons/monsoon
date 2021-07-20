import { ErrorModule } from "@modules/Error/error.module"
import { ProductModule } from "@modules/Product/product.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { ShopifyModule } from "@modules/Shopify/shopify.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { LocationFieldsResolver } from "./fields/location.fields.resolver"
import { LocationService } from "./services/location.service"

@Module({
  imports: [PrismaModule],
  providers: [LocationFieldsResolver, LocationService],
  exports: [LocationService],
})
export class LocationModule {}
