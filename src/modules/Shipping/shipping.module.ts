import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { PushNotificationModule } from "../PushNotification/pushNotification.module"
import { UtilsModule } from "../Utils/utils.module"
import { ShippoController } from "./controllers/shippo.controller"
import { ShippingMethodFieldsResolver } from "./fields/shippingMethod.fields.resolver"
import { ShippingMutationsResolver } from "./mutations/shipping.mutations"
import { ShippingQueriesResolver } from "./queries/shipping.queries.resolver"
import { ShippingService } from "./services/shipping.service"

export const SHIPPING_MODULE_DEF = {
  controllers: [ShippoController],
  imports: [UtilsModule, PrismaModule, PushNotificationModule],
  providers: [
    ShippingMutationsResolver,
    ShippingService,
    ShippingQueriesResolver,
    ShippingMethodFieldsResolver,
  ],
  exports: [ShippingService],
}
@Module(SHIPPING_MODULE_DEF)
export class ShippingModule {}
