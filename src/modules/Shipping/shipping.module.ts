import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { UtilsModule } from "../Utils/utils.module"
import { ShippingMutationsResolver } from "./mutations/shipping.mutations"
import { ShippingService } from "./services/shipping.service"

@Module({
  imports: [UtilsModule, PrismaModule],
  providers: [ShippingMutationsResolver, ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
