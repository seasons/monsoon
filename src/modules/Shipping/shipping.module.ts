import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { ShippingMutationsResolver } from "./mutations/shipping.mutations"
import { ShippingService } from "./services/shipping.service"
import { UtilsModule } from "../Utils/utils.module"

@Module({
  imports: [UtilsModule, PrismaModule],
  providers: [ShippingMutationsResolver, ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
