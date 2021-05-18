import { ImageModule } from "@modules/Image/image.module"
import { PushNotificationModule } from "@modules/PushNotification"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { FitPicFieldsResolver } from "./fields/fitpic.fields.resolver"
import { FitPicMutationsResolver } from "./mutations/fitpic.mutations.resolver"
import { FitPicQueriesResolver } from "./queries/fitpic.queries.resolver"
import { FitPicService } from "./services/fitpic.service"

@Module({
  imports: [ImageModule, PrismaModule, PushNotificationModule, ShippingModule],
  providers: [
    FitPicFieldsResolver,
    FitPicMutationsResolver,
    FitPicQueriesResolver,
    FitPicService,
  ],
  exports: [FitPicService],
})
export class FitPicModule {}
