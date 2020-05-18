import { Module } from "@nestjs/common"

import { PusherService } from "./services/pusher.service"
import { PushNotificationsDataProvider } from "./services/pushNotifications.data.service"
import { PushNotificationsService } from "./services/pushNotifications.service"

@Module({
  providers: [
    PusherService,
    PushNotificationsService,
    PushNotificationsDataProvider,
  ],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
