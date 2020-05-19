import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { PusherService } from "./services/pusher.service"
import { PushNotificationsDataProvider } from "./services/pushNotifications.data.service"
import { PushNotificationsService } from "./services/pushNotifications.service"

@Module({
  imports: [PrismaModule],
  providers: [
    PusherService,
    PushNotificationsService,
    PushNotificationsDataProvider,
  ],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
