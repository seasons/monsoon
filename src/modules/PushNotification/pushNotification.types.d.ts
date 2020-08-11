import { PushNotificationReceiptCreateInput } from "@app/prisma/prisma.binding"

export type PushNotificationID =
  | "Custom"
  | "CompleteAccount"
  | "NewBlogPost"
  | "ResumeReminder"
  | "ReservationShipped"
  | "ReservationDelivered"
  | "ResetBag"
  | "ReturnDue"
export type PushNotificationInterest = "seasons-general-notifications"
export type PushNotificationVars = NewBlogPostVars | {}

export interface NewBlogPostVars {
  headline: string
  category: string
  uri: string
}

export interface PushNotifyUserInput extends PushNotifyFuncInput {
  email: string
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
