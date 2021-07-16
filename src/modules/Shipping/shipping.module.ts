import { PrismaModule } from "@modules/Prisma/prisma.module"
import { PushNotificationModule } from "@modules/PushNotification/pushNotification.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"

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
