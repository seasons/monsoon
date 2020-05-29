import { PushNotificationReceiptCreateInput } from "@app/prisma/prisma.binding"

export type PushNotificationID = "ResetBag" | "ReturnDue" | "NewBlogPost"
export type PushNotificationInterest = "seasons-general-interest"
export type PushNotificationVars = NewBlogPostVars | {}

export interface NewBlogPostVars {
  headline: string
  category: string
  uri: string
}

export interface PushNotifyUserInput {
  email: string
  pushNotifID: PushNotificationID
}

export interface PushNotifyInterestInput {
  interest: PushNotificationInterest
  pushNotifID: PushNotificationID
  vars: PushNotificationVars
}

export interface ApplePushNotification {
  apns: any
}
export interface PushNotificationData {
  notificationPayload: ApplePushNotification
  receiptPayload: Omit<PushNotificationReceiptCreateInput, "users">
}
