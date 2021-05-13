import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { PushNotificationModule } from "../PushNotification/pushNotification.module"
import { UtilsModule } from "../Utils/utils.module"
import { ShippoController } from "./controllers/shippo.controller"
import { ShippingMutationsResolver } from "./mutations/shipping.mutations"
import { ShippingService } from "./services/shipping.service"

@Module({
  controllers: [ShippoController],
  imports: [UtilsModule, PrismaModule, PushNotificationModule],
  providers: [ShippingMutationsResolver, ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
