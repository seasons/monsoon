import "module-alias/register"

import { EmailService } from "../modules/Email/services/email.service"
import { EmailUtilsService } from "../modules/Email/services/email.utils.service"
import { ErrorService } from "../modules/Error/services/error.service"
import { ImageService } from "../modules/Image/services/image.service"
import { PusherService } from "../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../modules/PushNotification/services/pushNotification.service"
import { AuthService } from "../modules/User/services/auth.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const pusher = new PusherService()
  const error = new ErrorService()
  const image = new ImageService(ps)
  const utilsService = new UtilsService(ps)

  const emailUtils = new EmailUtilsService(ps, error, image)
  const pushNotifData = new PushNotificationDataProvider()
  const pushNotification = new PushNotificationService(
    pusher,
    pushNotifData,
    ps
  )
  const email = new EmailService(ps, utilsService, emailUtils)
  const auth = new AuthService(ps, pushNotification, email, error, utilsService)

  const customers = await ps.binding.query.customers(
    { where: { referralLink: null } },
    `{
    id 
    referralLink
    user {
      id
      firstName
    }
  }`
  )

  for (const customer of customers) {
    const firstName = customer.user.firstName
    const usersWithSameFirstName = await ps.client.users({
      where: { firstName },
    })

    const link =
      firstName.replace(/[^a-z]/gi, "") +
      (usersWithSameFirstName.length + 4).toString()

    // console.log("+++++++++++++++++++")
    // console.log("firstName", firstName)
    // console.log("existing link", customer.referralLink)
    // console.log("usersWithSameFirstName.length", usersWithSameFirstName.length)
    // console.log("link", link)
    // console.log("customer", customer.id)
    // console.log("+++++++++++++++++++")

    const referralLink = await auth.createReferralLink(customer.id, link)
    if (!referralLink.shortUrl) {
      console.log("referralLink.shortUrl", referralLink)
    } else {
      console.log("updating", customer.id)
      await ps.client.updateCustomer({
        where: { id: customer.id },
        data: {
          referralLink: referralLink.shortUrl,
        },
      })
    }
  }
}

const updateNames = async () => {
  const ps = new PrismaService()

  const users = await ps.client.users()

  let count = 0

  for (const user of users) {
    const firstName = user.firstName
    const lastName = user.lastName
    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()

    if (
      firstName &&
      lastName &&
      (trimmedFirstName !== firstName || trimmedLastName !== lastName)
    ) {
      count++
      console.log(count)
      console.log(user.id)
      await ps.client.updateUser({
        where: { id: user.id },
        data: {
          lastName: trimmedLastName,
          firstName: trimmedFirstName,
        },
      })
    }
  }
}

// updateNames()

run()
