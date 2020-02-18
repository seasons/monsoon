import PushNotifications from "@pusher/push-notifications-server"
import express from "express"

export const app = express()

export const beamsClient = new PushNotifications({
  instanceId: process.env.PUSHER_INSTANCE_ID,
  secretKey: process.env.PUSHER_SECRET_KEY,
})

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
