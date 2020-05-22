import "module-alias/register"

import PushNotifications from "@pusher/push-notifications-server"

const run = async () => {
  const client: PushNotifications = new PushNotifications({
    instanceId: process.env.PUSHER_INSTANCE_ID,
    secretKey: process.env.PUSHER_SECRET_KEY,
  })

  const y = await client.publishToUsers(["laura-collins@seasons.nyc"], {
    apns: {
      aps: { alert: { title: "yo", body: "yo" } },
      data: { route: "Faq" },
    },
  } as any)
  console.log(y)
}

run()
