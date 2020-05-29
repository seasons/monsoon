import fs from "fs"

import { Injectable } from "@nestjs/common"
import { AlertPayload } from "@pusher/push-notifications-server"

import { PushNotificationData } from "../pushNotifications.types"

export enum PushNotificationID {
  ResetBag,
  ReturnDue,
  NewBlogPost,
}

const maxTitleLength = 50
const maxBodyLength = 110

@Injectable()
export class PushNotificationsDataProvider {
  getPushNotifData(pushNotifID: PushNotificationID): PushNotificationData {
    const now = new Date()
    const { alert, data } = JSON.parse(
      fs.readFileSync(
        process.cwd() + "/src/modules/PushNotifications/data.json",
        "utf-8"
      )
    )[PushNotificationID[pushNotifID]]

    this.enforceLengths(alert)
    const receiptPayload = {
      title: alert?.title,
      body: alert?.body,
      route: data?.route,
      screen: data?.screen,
      uri: data?.params?.uri,
      sentAt: now.toISOString(),
    }
    const notificationPayload = this.wrapAPNsData(alert, data)
    return {
      notificationPayload,
      receiptPayload,
    }
  }

  private enforceLengths(alert: AlertPayload): AlertPayload {
    if (alert.title?.length > maxTitleLength) {
      throw new Error("Push notification title exceeds max length of 50 chars")
    }
    if (alert.body?.length > maxBodyLength) {
      throw new Error("Push notification body exceeds max length of 110 chars")
    }
    return alert
  }

  private wrapAPNsData = (alert, data) => ({ apns: { aps: { alert }, data } })
}
