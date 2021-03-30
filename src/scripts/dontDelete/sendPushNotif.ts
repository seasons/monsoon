import "module-alias/register"

import { chunk } from "lodash"

import { ErrorService } from "../../modules/Error/services/error.service"
import { PusherService } from "../../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../../modules/PushNotification/services/pushNotification.service"
import { PrismaService } from "../../prisma/prisma.service"

/*
 *  Use: This script can be used to make a reservation feedback object on a specific user for testing purposes
 *  Reason not to delete: This is helpful for testing the reservation feedback flow
 */
const run = async () => {
  const ps = new PrismaService()
  const pusher = new PusherService()
  const pushNotifData = new PushNotificationDataProvider()
  const error = new ErrorService()
  const pushNotificationService = new PushNotificationService(
    pusher,
    pushNotifData,
    ps,
    error
  )

  const target = await ps.binding.query.customers(
    {
      where: { status_in: ["Active", "Paused", "Waitlisted"] },
    },
    `{id user {id email}}`
  )
  const emails = target.map(a => a.user.email)

  for (const emailsChunk of chunk(emails, 999)) {
    await pushNotificationService.pushNotifyUsers({
      emails: emailsChunk,
      pushNotifID: "Custom",
      vars: {
        title: "New Arrivals: Phipps",
        body: "Bowling shirts, work jackets, knitwear & more",
      },
    })
  }
}

run()
