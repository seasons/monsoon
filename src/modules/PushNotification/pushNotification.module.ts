import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { ErrorService } from "../Error/services/error.service"
import { PushNotificationMutationsResolver } from "./mutations/pushNotification.mutations"
import { PushNotificationsQueriesResolver } from "./queries/pushNotifications.queries.resolver"
import { PusherService } from "./services/pusher.service"
import { PushNotificationDataProvider } from "./services/pushNotification.data.service"
import { PushNotificationService } from "./services/pushNotification.service"

@Module({
  imports: [PrismaModule],
  providers: [
    ErrorService,
    PusherService,
    PushNotificationService,
    PushNotificationDataProvider,
    PushNotificationsQueriesResolver,
    PushNotificationMutationsResolver,
  ],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
