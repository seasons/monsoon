import { ImageModule } from "@modules/Image"
import { PushNotificationModule } from "@modules/PushNotification"
import { UserModule } from "@modules/User/user.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { PublicFitPicFieldsResolver } from "./fields/publicfitpic.fields.resolver"
import { FitPicMutationsResolver } from "./mutations/fitpic.mutations.resolver"
import { FitPicQueriesResolver } from "./queries/fitpic.queries.resolver"
import { FitPicService } from "./services/fitpic.service"

@Module({
  imports: [ImageModule, PrismaModule, PushNotificationModule, UserModule],
  providers: [
    PublicFitPicFieldsResolver,
    FitPicMutationsResolver,
    FitPicQueriesResolver,
    FitPicService,
  ],
  exports: [FitPicService],
})
export class FitPicModule {}
