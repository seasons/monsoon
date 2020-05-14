import "module-alias/register"

import PushNotifications from "@pusher/push-notifications-server"

const run = async () => {
  const client: PushNotifications = new PushNotifications({
    instanceId: process.env.PUSHER_INSTANCE_ID,
    secretKey: process.env.PUSHER_SECRET_KEY,
  })

  await client.publishToUsers(["faiyam+1@faiyamrahman.com"], {
    apns: {
      aps: {
        alert: "Hello!",
      },
    },
  })
}

run()
