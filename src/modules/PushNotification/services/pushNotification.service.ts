import { ErrorService } from "@app/modules/Error/services/error.service"
import { UserPushNotificationInterestType } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Token } from "@pusher/push-notifications-server"
import { upperFirst } from "lodash"

import {
  PushNotifyInterestInput,
  PushNotifyUsersInput,
} from "../pushNotification.types"
import { PusherService } from "./pusher.service"
import { PushNotificationDataProvider } from "./pushNotification.data.service"

@Injectable()
export class PushNotificationService {
  constructor(
    private readonly pusher: PusherService,
    private readonly data: PushNotificationDataProvider,
    private readonly prisma: PrismaService,
    private readonly error: ErrorService
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

    // // Create the receipt
    let usersToUpdate = await this.prisma.client.users({
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
    if (targetInterest.includes("debug")) {
      usersToUpdate = usersToUpdate.filter(a => a.roles.includes("Admin"))
    }
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
    // await each one separately. Sending them simultaneously fails on the DB
    for (const update of updates) {
      await update
    }

    return receipt
  }

  async pushNotifyUsers({
    emails,
    pushNotifID,
    vars = {},
    debug = false,
  }: PushNotifyUsersInput) {
    try {
      // Determine the target user
      let targetEmails = [process.env.PUSH_NOTIFICATIONS_DEFAULT_EMAIL]
      if (!debug && process.env.NODE_ENV === "production") {
        targetEmails = emails
      }

      // Send the notification
      const {
        receiptPayload,
        notificationPayload,
      } = this.data.getPushNotifData(pushNotifID, vars)
      await this.pusher.client.publishToUsers(
        targetEmails,
        notificationPayload as any
      )

      const receipts = {}
      if (targetEmails?.length) {
        for (const email of targetEmails) {
          // Create the receipt
          const receipt = await this.prisma.client.createPushNotificationReceipt(
            {
              ...receiptPayload,
              users: { connect: [{ email }] },
            }
          )

          // Update the user's history
          await this.prisma.client.updateUser({
            where: { email },
            data: this.getUpdateUserPushNotificationHistoryData(receipt.id),
          })

          receipts[email] = receipt
        }
      }

      return receipts
    } catch (e) {
      console.log("e", e)
      this.error.setExtraContext({ emails, pushNotifID })
      this.error.setExtraContext({ vars }, "vars")
      this.error.captureError(e)
    }
  }

  private getUpdateUserPushNotificationHistoryData = receiptID => ({
    pushNotification: {
      update: { history: { connect: [{ id: receiptID }] } },
    },
  })

  // assumes pusher interests are of the form seasons-{interestType}-notifications or
  // debug-seasons-{interestType}-notifications e.g seasons-general-notifications
  private pusherInterestToPrismaInterestType(
    pusherInterest: string
  ): UserPushNotificationInterestType {
    const pusherInterestWithoutDebug = pusherInterest.replace(/debug-/, "")
    let interestType = pusherInterestWithoutDebug.split("-")?.[1]
    if (interestType === "newproduct") {
      interestType = "newProduct"
    }
    return upperFirst(interestType) as UserPushNotificationInterestType
  }
}
