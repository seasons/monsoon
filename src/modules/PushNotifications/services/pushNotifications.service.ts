import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Token } from "@pusher/push-notifications-server"

import {
  PushNotifyInterestInput,
  PushNotifyUserInput,
} from "../pushNotifications.types"
import { PusherService } from "./pusher.service"
import { PushNotificationsDataProvider } from "./pushNotifications.data.service"

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

  async pushNotifyInterest({
    interest,
    pushNotifID,
    vars = {},
    debug = false,
  }: PushNotifyInterestInput) {
    let targetInterest = `debug-${interest}`
    if (!debug && process.env.NODE_ENV === "production") {
      targetInterest = interest
    }
    const { receiptPayload, notificationPayload } = this.data.getPushNotifData(
      pushNotifID,
      vars
    )
    await this.pusher.client.publishToInterests(
      [targetInterest],
      notificationPayload as any
    )
    return await this.prisma.client.createPushNotificationReceipt({
      ...receiptPayload,
      interest: targetInterest,
    })
  }

  async pushNotifyUser({
    email,
    pushNotifID,
    vars = {},
    debug = false,
  }: PushNotifyUserInput) {
    let targetEmail = process.env.PUSH_NOTIFICATIONS_DEFAULT_EMAIL
    if (!debug && process.env.NODE_ENV === "production") {
      targetEmail = email
    }

    const { receiptPayload, notificationPayload } = this.data.getPushNotifData(
      pushNotifID,
      vars
    )
    await this.pusher.client.publishToUsers(
      [targetEmail],
      notificationPayload as any
    )
    return await this.prisma.client.createPushNotificationReceipt({
      ...receiptPayload,
      users: { connect: [{ email: targetEmail }] },
    })
  }
}
