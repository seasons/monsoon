import { Injectable } from "@nestjs/common"
import PushNotifications from "@pusher/push-notifications-server"

@Injectable()
export class PusherService {
  client: PushNotifications = new PushNotifications({
    instanceId: process.env.PUSHER_INSTANCE_ID,
    secretKey: process.env.PUSHER_SECRET_KEY,
  })
}
