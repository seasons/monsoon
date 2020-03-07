import { Module } from "@nestjs/common"
import { ShippingService } from "./services/shipping.service"
import { UtilsModule } from "../Utils/utils.module"
import { PrismaModule } from "../../prisma/prisma.module"

@Module({
  imports: [UtilsModule, PrismaModule],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
