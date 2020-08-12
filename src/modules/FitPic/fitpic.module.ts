import { ImageModule } from "@modules/Image"
import { PushNotificationModule } from "@modules/PushNotification"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { AuthUtilsService } from "@modules/User/services/auth.utils.service"
import { UserModule } from "@modules/User/user.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { FitPicFieldsResolver } from "./fields/fitpic.fields.resolver"
import { FitPicMutationsResolver } from "./mutations/fitpic.mutations.resolver"
import { FitPicQueriesResolver } from "./queries/fitpic.queries.resolver"
import { FitPicService } from "./services/fitpic.service"

@Module({
  imports: [
    ImageModule,
    PrismaModule,
    PushNotificationModule,
    ShippingModule,
    UserModule,
  ],
  providers: [
    FitPicFieldsResolver,
    FitPicMutationsResolver,
    FitPicQueriesResolver,
    FitPicService,
  ],
  exports: [FitPicService],
})
export class FitPicModule {}
