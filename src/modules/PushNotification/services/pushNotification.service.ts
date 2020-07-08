import {
  ID_Input,
  UserPushNotificationInterest,
  UserPushNotificationInterestType,
} from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Token } from "@pusher/push-notifications-server"
import { upperFirst } from "lodash"

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
    // Decipher the interest
    let targetInterest = `debug-${interest}`
    if (!debug && process.env.NODE_ENV === "production") {
      targetInterest = interest
    }

    // Send the notification
    const { receiptPayload, notificationPayload } = this.data.getPushNotifData(
      pushNotifID,
      vars
    )
    await this.pusher.client.publishToInterests(
      [targetInterest],
      notificationPayload as any
    )

    // Create the receipt
    const usersToUpdate = await this.prisma.client.users({
      where: {
        pushNotification: {
          AND: [
            { status: true },
            {
              interests_some: {
                AND: [
                  {
                    type: this.pusherInterestToPrismaInterestType(
                      targetInterest
                    ),
                  },
                  { status: true },
                ],
              },
            },
          ],
        },
      },
    })
    const receipt = await this.prisma.client.createPushNotificationReceipt({
      ...receiptPayload,
      interest: targetInterest,
      users: { connect: usersToUpdate.map(a => ({ id: a.id })) },
    })

    // Update user histories
    const updates = usersToUpdate.map(a =>
      this.prisma.client.updateUser({
        where: { id: a.id },
        data: this.getUpdateUserPushNotificationHistoryData(receipt.id),
      })
    )
    await Promise.all(updates)

    return receipt
  }

  async pushNotifyUser({
    email,
    pushNotifID,
    vars = {},
    debug = false,
  }: PushNotifyUserInput) {
<<<<<<< HEAD
    // Should we even run?
=======
    let targetEmail = process.env.PUSH_NOTIFICATIONS_DEFAULT_EMAIL
>>>>>>> 52be72c... when we push notify a user, the receipt is attached to their history
    const targetUser = await this.prisma.binding.query.user(
      {
        where: { email },
      },
      `{
        roles
        pushNotification {
          id
<<<<<<< HEAD
          status
        }
      }`
    )
    if (!targetUser.pushNotification.status) {
      return null
    }

    // Determine the target user
    let targetEmail = process.env.PUSH_NOTIFICATIONS_DEFAULT_EMAIL
=======
        }
      }`
    )
>>>>>>> 52be72c... when we push notify a user, the receipt is attached to their history
    const isAdmin = targetUser.roles.includes("Admin")
    if (isAdmin || (!debug && process.env.NODE_ENV === "production")) {
      targetEmail = email
    }

    // Send the notification
    const { receiptPayload, notificationPayload } = this.data.getPushNotifData(
      pushNotifID,
      vars
    )
    await this.pusher.client.publishToUsers(
      [targetEmail],
      notificationPayload as any
    )
<<<<<<< HEAD

    // Create the receipt
=======
>>>>>>> 52be72c... when we push notify a user, the receipt is attached to their history
    const receipt = await this.prisma.client.createPushNotificationReceipt({
      ...receiptPayload,
      users: { connect: [{ email: targetEmail }] },
    })
<<<<<<< HEAD

    // Update the user's history
    await this.prisma.client.updateUser({
      where: { email: targetEmail },
      data: this.getUpdateUserPushNotificationHistoryData(receipt.id),
    })

    return receipt
  }

  private getUpdateUserPushNotificationHistoryData = receiptID => ({
    pushNotification: {
      update: { history: { connect: [{ id: receiptID }] } },
    },
  })

  // assumes pusher interests are of the same seasons-{interestType}-notifications or
  // debug-seasons-{interestType}-notifications e.g seasons-general-notifications
  private pusherInterestToPrismaInterestType(
    pusherInterest: string
  ): UserPushNotificationInterestType {
    debugger
    const pusherInterestWithoutDebug = pusherInterest.replace(/debug-/, "")
    let interestType = pusherInterestWithoutDebug.split("-")?.[1]
    if (interestType === "newproduct") {
      interestType = "newProduct"
    }
    return upperFirst(interestType) as UserPushNotificationInterestType
=======
    await this.prisma.client.updateUser({
      where: { email: targetEmail },
      data: {
        pushNotification: {
          update: { history: { connect: [{ id: receipt.id }] } },
        },
      },
    })
    return receipt
>>>>>>> 52be72c... when we push notify a user, the receipt is attached to their history
  }
}
