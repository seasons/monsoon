import PushNotifications from "@pusher/push-notifications-server"
import express from "express"

export const app = express()

const { PUSHER_INSTANCE_ID, PUSHER_SECRET_KEY } = process.env

export let beamsClient: PushNotifications | null = null

if (PUSHER_INSTANCE_ID && PUSHER_SECRET_KEY) {
  beamsClient = new PushNotifications({
    instanceId: PUSHER_INSTANCE_ID,
    secretKey: PUSHER_SECRET_KEY,
  })
}

app.get("/pusher/beams-auth", (req: any, res) => {
  // Do your normal auth checks here 🔒
  const userId = req.user.id // get it from your auth system
  const userIDInQueryParam = req.query.user_id
  if (userId !== userIDInQueryParam) {
    res.send(401)
  } else {
    const beamsToken = beamsClient.generateToken(userId)
    res.send(JSON.stringify(beamsToken))
  }
})
