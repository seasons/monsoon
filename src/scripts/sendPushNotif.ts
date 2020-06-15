import "module-alias/register"

import PushNotifications from "@pusher/push-notifications-server"

import { PusherService } from "../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../modules/PushNotification/services/pushNotification.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const pns = new PushNotificationService(
    new PusherService(),
    new PushNotificationDataProvider(),
    new PrismaService()
  )

  await pns.pushNotifyUser({
    email: "grace-mckenzie@seasons.nyc",
    pushNotifID: "Custom",
    vars: { title: "yo", body: "yo" },
  })
}

run()
