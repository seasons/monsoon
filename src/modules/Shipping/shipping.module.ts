import { Module } from "@nestjs/common"
import { ShippingService } from "./services/shipping.service"
import { UtilsModule } from "../Utils/utils.module"
import { PrismaModule } from "@prisma/prisma.module"
import { ShippingMutationsResolver } from "./mutations/shipping.mutations"

@Module({
  imports: [UtilsModule, PrismaModule],
  providers: [ShippingMutationsResolver, ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
