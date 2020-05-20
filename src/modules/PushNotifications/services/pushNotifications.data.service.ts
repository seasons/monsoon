import fs from "fs"

import { Injectable } from "@nestjs/common"
import { AlertPayload } from "@pusher/push-notifications-server"
import { pick } from "lodash"

import { PushNotificationData } from "../pushNotifications.types"

export enum PushNotificationID {
  ResetBag,
  ReturnDue,
}

const maxTitleLength = 50
const maxBodyLength = 100

@Injectable()
export class PushNotificationsDataProvider {
  getPushNotifData(pushNotifID: PushNotificationID): PushNotificationData {
    const now = new Date()
    const alert = this.enforceLengths(
      JSON.parse(
        fs.readFileSync(
          process.cwd() + "/src/modules/PushNotifications/data.json",
          "utf-8"
        )
      )[PushNotificationID[pushNotifID]]
    )
    return {
      notificationPayload: this.wrapAPNsData(alert),
      receiptPayload: {
        ...pick(alert, ["title", "body"]),
        sentAt: now.toISOString(),
      },
    }
  }

  private enforceLengths(alert: AlertPayload): AlertPayload {
    debugger
    if (alert.title?.length > maxTitleLength) {
      throw new Error("Push notification title exceeds max length of 50 chars")
    }
    debugger
    if (alert.body?.length > maxBodyLength) {
      throw new Error("Push notification body exceeds max length of 100 chars")
    }
    debugger
    return alert
  }

  private wrapAPNsData = a => ({ apns: { aps: { alert: a } } })
}
