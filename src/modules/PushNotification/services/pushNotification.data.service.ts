import fs from "fs"

import { Injectable } from "@nestjs/common"
import { AlertPayload } from "@pusher/push-notifications-server"
import mustache from "mustache"

import {
  PushNotificationData,
  PushNotificationID,
  PushNotificationVars,
} from "../pushNotification.types"

const maxTitleLength = 50
const maxBodyLength = 110

export const AllPushNotificationIDs = [
  "Custom",
  "CompleteAccount",
  "NewBlogPost",
  "ReservationShipped",
  "ReservationDelivered",
  "ResetBag",
  "ReturnDue",
  "PublishFitPic",
  "ProductRestock",
] as const

@Injectable()
export class PushNotificationDataProvider {
  getPushNotifData(
    pushNotifID: PushNotificationID,
    vars: PushNotificationVars
  ): PushNotificationData {
    let { alert, data } = JSON.parse(
      fs.readFileSync(
        process.cwd() + "/src/modules/PushNotification/data.json",
        "utf-8"
      )
    )[pushNotifID]

    alert = this.interpolateJSONObjectWithMustache(alert, vars)
    if (!!data) {
      data = this.interpolateJSONObjectWithMustache(data, vars)
    }

    this.enforceLengths(alert, pushNotifID)

    const now = new Date()
    const receiptPayload = {
      title: alert?.title,
      body: alert?.body,
      route: data?.route,
      screen: data?.screen,
      uri: data?.params?.uri,
      notificationKey: pushNotifID,
      recordID: data?.params?.id,
      recordSlug: data?.params?.slug,
      sentAt: now.toISOString(),
    }
    const notificationPayload = this.wrapAPNsData(alert, data)

    return {
      notificationPayload,
      receiptPayload,
    }
  }

  private enforceLengths(
    alert: AlertPayload,
    pushNotifID: PushNotificationID
  ): AlertPayload {
    if (alert.title?.length > maxTitleLength) {
      throw new Error(
        `Push notification ${pushNotifID} title exceeds max length of 50 chars`
      )
    }
    if (alert.body?.length > maxBodyLength) {
      throw new Error(
        `Push notification ${pushNotifID} body exceeds max length of 110 chars`
      )
    }
    return alert
  }

  private wrapAPNsData = (alert, data) => ({ apns: { aps: { alert }, data } })

  private interpolateJSONObjectWithMustache(obj: any, vars: any = {}) {
    return JSON.parse(mustache.render(JSON.stringify(obj), vars))
  }
}
