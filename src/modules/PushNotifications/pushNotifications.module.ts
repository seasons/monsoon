import { Module } from "@nestjs/common"

import { PusherService } from "./services/pusher.service"
import { PushNotificationsService } from "./services/pushNotifications.service"

@Module({
  providers: [PusherService, PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
