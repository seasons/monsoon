import { PushNotificationReceiptCreateInput } from "@app/prisma/prisma.binding"

import { AllPushNotificationIDs } from "./services/pushNotification.data.service"

export type PushNotificationID = typeof AllPushNotificationIDs[number]
export type PushNotificationInterest = "seasons-general-notifications"
export type PushNotificationVars = NewBlogPostVars | {}

export interface NewBlogPostVars {
  headline: string
  category: string
  uri: string
}

export interface PushNotifyUsersInput extends PushNotifyFuncInput {
  emails: string[]
}

export interface PushNotifyInterestInput extends PushNotifyFuncInput {
  interest: PushNotificationInterest
}

interface PushNotifyFuncInput {
  pushNotifID: PushNotificationID
  vars?: any
  debug?: boolean
}

export interface ApplePushNotification {
  apns: any
}
export interface PushNotificationData {
  notificationPayload: ApplePushNotification
  receiptPayload: Omit<PushNotificationReceiptCreateInput, "users">
}
