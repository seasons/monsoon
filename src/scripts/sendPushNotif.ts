import "module-alias/register"

import PushNotifications from "@pusher/push-notifications-server"

const run = async () => {
  const client: PushNotifications = new PushNotifications({
    instanceId: process.env.PUSHER_INSTANCE_ID,
    secretKey: process.env.PUSHER_SECRET_KEY,
  })

  // const y = await client.publishToInterests(
  //   ["debug-seasons-general-notifications"],
  //   {
  const y = await client.publishToUsers(["faiyam+1@faiyamrahman.com"], {
    apns: {
      aps: { alert: { title: "yo", body: "yo" } },
      data: {
        route: "Brand",
        params: { id: "ck2ze8lgo0p1307347rt0emdj", slug: "acne-studios" },
      },
    },
  } as any)
  console.log(y)
}

run()
