import fs from "fs"

import { Injectable } from "@nestjs/common"
import { AlertPayload } from "@pusher/push-notifications-server"
import mustache from "mustache"

import {
  PushNotificationData,
  PushNotificationID,
  PushNotificationVars,
} from "../pushNotifications.types"

const maxTitleLength = 50
const maxBodyLength = 110

@Injectable()
export class PushNotificationsDataProvider {
  getPushNotifData(
    pushNotifID: PushNotificationID,
    vars: PushNotificationVars
  ): PushNotificationData {
    let { alert, data } = JSON.parse(
      fs.readFileSync(
        process.cwd() + "/src/modules/PushNotifications/data.json",
        "utf-8"
      )
    )[pushNotifID]

    alert = this.interpolateJSONObjectWithMustache(alert, vars)
    data = this.interpolateJSONObjectWithMustache(data, vars)

    this.enforceLengths(alert)

    const now = new Date()
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

  private interpolateJSONObjectWithMustache(obj: any, vars: any) {
    return JSON.parse(mustache.render(JSON.stringify(obj), vars))
  }
}
