import fs from "fs"

import { Injectable } from "@nestjs/common"
import { pick } from "lodash"

import { PushNotificationData } from "../pushNotifications.types"

export enum PushNotificationID {
  ResetBag,
  ReturnDue,
}

@Injectable()
export class PushNotificationsDataProvider {
  getPushNotifData(pushNotifID: PushNotificationID): PushNotificationData {
    const now = new Date()
    const alert = JSON.parse(
      fs.readFileSync(
        process.cwd() + "/src/modules/PushNotifications/data.json",
        "utf-8"
      )
    )[PushNotificationID[pushNotifID]]
    return {
      notificationPayload: this.wrapAPNsData(alert),
      receiptPayload: {
        ...pick(alert, ["title", "body"]),
        sentAt: now.toISOString(),
      },
    }
  }

  private wrapAPNsData = a => ({ apns: { aps: { alert: a } } })
}
