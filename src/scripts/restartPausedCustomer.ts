import "module-alias/register"

import chargebee from "chargebee"
import { head } from "lodash"
import { DateTime } from "luxon"

import { EmailDataProvider } from "../modules/Email/services/email.data.service"
import { EmailService } from "../modules/Email/services/email.service"
import { PaymentService } from "../modules/Payment/services/payment.service"
import { PaymentUtilsService } from "../modules/Payment/services/payment.utils.service"
import { PusherService } from "../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../modules/PushNotification/services/pushNotification.service"
import { ShippingService } from "../modules/Shipping/services/shipping.service"
import { CustomerService } from "../modules/User"
import { AuthService } from "../modules/User/services/auth.service"
import { UtilsService } from "../modules/Utils"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const utilsService = new UtilsService(ps)
  const emailData = new EmailDataProvider()
  const paymentUtils = new PaymentUtilsService()
  const emailService = new EmailService(ps, utilsService, emailData)
  const shippingService = new ShippingService(ps, utilsService)
  const pusherService = new PusherService()
  const pushNotificationDataProvider = new PushNotificationDataProvider()
  const pushNotification = new PushNotificationService(
    pusherService,
    pushNotificationDataProvider,
    ps
  )
  const authService = new AuthService(ps, pushNotification)
  const customerService = new CustomerService(authService, ps, shippingService)
  const paymentService = new PaymentService(
    authService,
    customerService,
    emailService,
    paymentUtils,
    ps,
    utilsService
  )

  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })

  const customerID = ""
  const pausedCustomer = await ps.client.customer({
    id: customerID,
  })

  const pauseRequests = await ps.client.pauseRequests({
    where: {
      membership: {
        customer: {
          id: customerID,
        },
      },
    },
    orderBy: "createdAt_DESC",
  })

  const pauseRequest = head(pauseRequests) as any

  const customerWithMembership = (await ps.binding.query.pauseRequest(
    { where: { id: pauseRequest.id } },
    `
          {
            id
            membership {
              id
              subscriptionId
            }
          }
        `
  )) as any

  const subscriptionId = customerWithMembership?.membership?.subscriptionId

  if (!subscriptionId) {
    return
  }

  paymentService.resumeSubscription(subscriptionId, null, pausedCustomer)
}

run()
