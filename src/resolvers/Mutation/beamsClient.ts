import PushNotifications from "@pusher/push-notifications-server"
const { PUSHER_INSTANCE_ID, PUSHER_SECRET_KEY } = process.env

export const beamsClient: PushNotifications | null =
  PUSHER_INSTANCE_ID && PUSHER_SECRET_KEY
    ? new PushNotifications({
        instanceId: PUSHER_INSTANCE_ID,
        secretKey: PUSHER_SECRET_KEY,
      })
    : null
