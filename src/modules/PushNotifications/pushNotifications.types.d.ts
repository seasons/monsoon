import { PushNotificationReceiptCreateInput } from "@app/prisma/prisma.binding"
import { PublishRequestWithApns } from "@pusher/push-notifications-server"

export interface PushNotificationData {
  notificationPayload: PublishRequestWithApns
  receiptPayload: Omit<PushNotificationReceiptCreateInput, "users">
}
