import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Token } from "@pusher/push-notifications-server"

import { PusherService } from "./pusher.service"
import {
  PushNotificationID,
  PushNotificationsDataProvider,
} from "./pushNotifications.data.service"

@Injectable()
export class PushNotificationsService {
  constructor(
    private readonly pusher: PusherService,
    private readonly data: PushNotificationsDataProvider,
    private readonly prisma: PrismaService
  ) {}

  generateToken(email: string): Token {
    return (this.pusher.client.generateToken(email) as any).token
  }

  async pushNotifyUser({
    email,
    pushNotifID,
  }: {
    email: string
    pushNotifID: PushNotificationID
  }) {
    let targetEmail = process.env.PUSH_NOTIFICATIONS_DEFAULT_EMAIL
    if (process.env.NODE_ENV === "production") {
      targetEmail = email
    }

    const { receiptPayload, notificationPayload } = this.data.getPushNotifData(
      pushNotifID
    )
    await this.pusher.client.publishToUsers([targetEmail], notificationPayload)
    await this.prisma.client.createPushNotificationReceipt({
      ...receiptPayload,
      users: { connect: [{ email: email }] },
    })
  }
}
