import { ErrorService } from "@app/modules/Error/services/error.service"
import { UserPushNotificationInterestType } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { Token } from "@pusher/push-notifications-server"
import { difference, upperFirst } from "lodash"

import {
  PushNotificationID,
  PushNotifyInterestInput,
  PushNotifyUsersInput,
} from "../pushNotification.types"
import { PusherService } from "./pusher.service"
import {
  AllPushNotificationIDs,
  PushNotificationDataProvider,
} from "./pushNotification.data.service"

@Injectable()
export class PushNotificationService {
  constructor(
    private readonly pusher: PusherService,
    private readonly data: PushNotificationDataProvider,
    private readonly prisma: PrismaService,
    private readonly error: ErrorService
  ) {
    for (const id of AllPushNotificationIDs) {
      this.data.getPushNotifData(id, {}) // run this to enforce lengths on all notifs at boot time
    }
  }

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
    let _usersToUpdate = await this.prisma.client2.user.findMany({
      where: {
        pushNotification: {
          AND: [
            { status: true },
            {
              interests: {
                some: {
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
            },
          ],
        },
      },
      select: { id: true, roles: true },
    })

    let usersToUpdate = this.prisma.sanitizePayload(_usersToUpdate, "User")

    if (targetInterest.includes("debug")) {
      usersToUpdate = usersToUpdate.filter(a =>
        a.roles.includes("Admin" as any)
      )
    }

    const receipt = await this.prisma.client2.pushNotificationReceipt.create({
      data: {
        ...receiptPayload,
        interest: targetInterest,
        users: { connect: usersToUpdate.map(a => ({ id: a.id })) },
      },
    })

    // Update user histories
    const updates = usersToUpdate.map(a =>
      this.prisma.client2.user.update({
        where: { id: a.id },
        data: {
          pushNotification: {
            update: { history: { connect: [{ id: receipt.id }] } },
          },
        },
      })
    )

    await this.prisma.client2.$transaction(updates)

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

      if (targetEmails?.length) {
        // Send the notification
        const {
          receiptPayload,
          notificationPayload,
        } = this.data.getPushNotifData(pushNotifID, vars)

        // Filter any emails that have received this push notification before
        const pushNotificationReceipts = await this.prisma.client2.pushNotificationReceipt.findMany(
          {
            where: {
              title: notificationPayload?.apns?.aps?.alert?.title,
              body: notificationPayload?.apns?.aps?.alert?.body,
              users: {
                some: {
                  email: {
                    in: targetEmails,
                  },
                },
              },
            },
            select: { id: true, users: true },
          }
        )

        const emailsNotifAlreadySent = pushNotificationReceipts
          .map(a => a.users.map(b => b.email))
          .flat()

        const updatedTargetEmails = difference(
          targetEmails,
          emailsNotifAlreadySent
        )

        await this.pusher.client.publishToUsers(
          updatedTargetEmails,
          notificationPayload as any
        )

        const receipt = await this.prisma.client2.pushNotificationReceipt.create(
          {
            data: {
              ...receiptPayload,
              users: { connect: updatedTargetEmails.map(email => ({ email })) },
            },
          }
        )

        const promises = []

        for (const email of targetEmails) {
          // Update the user's history
          promises.push(
            this.prisma.client2.user.update({
              where: { email },
              data: {
                pushNotification: {
                  update: { history: { connect: [{ id: receipt.id }] } },
                },
              },
            })
          )
        }

        await this.prisma.client2.$transaction(promises)

        return receipt
      }
    } catch (e) {
      console.log("e", e)
      this.error.setExtraContext({ emails, pushNotifID })
      this.error.setExtraContext({ vars }, "vars")
      this.error.captureError(e)
    }
  }

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
