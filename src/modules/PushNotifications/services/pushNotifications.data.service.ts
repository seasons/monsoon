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
    const alert = this.pushNotifDefinitions[pushNotifID]
    return {
      notificationPayload: this.wrapAPNsData(alert),
      receiptPayload: {
        ...pick(alert, ["title", "body"]),
        sentAt: now.toISOString(),
      },
    }
  }

  private wrapAPNsData = a => ({ apns: { aps: { alert: a } } })

  private pushNotifDefinitions = {
    [PushNotificationID.ResetBag]: {
      title: "Your bag has been reset!",
      body:
        "Your bag has been reset. You are now free to place another reservation.",
    },
    [PushNotificationID.ReturnDue]: {
      title: "Your return is due soon",
      body:
        "Your return is due in 3 days. Please ensure to ship back your items.",
    },
  }
}
