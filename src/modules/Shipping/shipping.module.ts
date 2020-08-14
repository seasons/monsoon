import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { PushNotificationModule } from "../PushNotification/pushNotification.module"
import { UtilsModule } from "../Utils/utils.module"
import { ShippoController } from "./controllers/shippo.controller"
import { ShippingMutationsResolver } from "./mutations/shipping.mutations"
import { ShippingService } from "./services/shipping.service"
import { ShippingUtilsService } from "./services/shipping.utils.service"

@Module({
  controllers: [ShippoController],
  imports: [UtilsModule, PrismaModule, PushNotificationModule],
  providers: [ShippingMutationsResolver, ShippingService, ShippingUtilsService],
  exports: [ShippingService, ShippingUtilsService],
})
export class ShippingModule {}
