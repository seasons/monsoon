import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Token } from "@pusher/push-notifications-server"

import {
  PushNotifyInterestInput,
  PushNotifyUserInput,
} from "../pushNotification.types"
import { PusherService } from "./pusher.service"
import { PushNotificationDataProvider } from "./pushNotification.data.service"

@Injectable()
export class PushNotificationService {
  constructor(
    private readonly pusher: PusherService,
    private readonly data: PushNotificationDataProvider,
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
    const targetUser = await this.prisma.binding.query.user(
      {
        where: { email },
      },
      `{
        roles
        pushNotification {
          id
        }
      }`
    )
    const isAdmin = targetUser.roles.includes("Admin")
    if (isAdmin || (!debug && process.env.NODE_ENV === "production")) {
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
    const receipt = await this.prisma.client.createPushNotificationReceipt({
      ...receiptPayload,
      users: { connect: [{ email: targetEmail }] },
    })
    await this.prisma.client.updateUser({
      where: { email: targetEmail },
      data: {
        pushNotification: {
          update: { history: { connect: [{ id: receipt.id }] } },
        },
      },
    })
    return receipt
  }
}
