import "module-alias/register"

import chargebee from "chargebee"
import { head } from "lodash"
import { DateTime } from "luxon"

import { SegmentService } from "../modules/Analytics/services/segment.service"
import { EmailDataProvider } from "../modules/Email/services/email.data.service"
import { EmailService } from "../modules/Email/services/email.service"
import { PaymentService } from "../modules/Payment/services/payment.service"
import { PaymentUtilsService } from "../modules/Payment/services/payment.utils.service"
import { PusherService } from "../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../modules/PushNotification/services/pushNotification.service"
import { ShippingService } from "../modules/Shipping/services/shipping.service"
import { ShippingUtilsService } from "../modules/Shipping/services/shipping.utils.service"
import { CustomerService } from "../modules/User"
import { AdmissionsService } from "../modules/User/services/admissions.service"
import { AuthService } from "../modules/User/services/auth.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaDataLoader, PrismaLoader } from "../prisma/prisma.loader"
import { PrismaService } from "../prisma/prisma.service"

const updatePausePendingCustomersToBeImmediatelyPaused = async () => {
  const ps = new PrismaService()
  const utilsService = new UtilsService(ps)
  const admissions = new AdmissionsService(ps, utilsService)
  const emailData = new EmailDataProvider()
  const segment = new SegmentService()
  const paymentUtils = new PaymentUtilsService()
  const shippingUtils = new ShippingUtilsService()
  const emailService = new EmailService(ps, utilsService, emailData)
  const shippingService = new ShippingService(ps, utilsService)
  const pusherService = new PusherService()
  const pushNotificationDataProvider = new PushNotificationDataProvider()
  const pushNotification = new PushNotificationService(
    pusherService,
    pushNotificationDataProvider,
    ps
  )
  const authService = new AuthService(ps, pushNotification, shippingUtils)
  const customerService = new CustomerService(
    authService,
    ps,
    shippingService,
    admissions,
    segment
  )
  const paymentService = new PaymentService(
    authService,
    customerService,
    emailService,
    paymentUtils,
    ps,
    utilsService,
    segment
  )

  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })

  try {
    const customers = await ps.client.customers({
      where: { status: "Active" },
    })

    for (const customer of customers) {
      const customerWithData = (await ps.binding.query.customer(
        {
          where: { id: customer.id },
        },
        `{
          id
          status
          plan
          user {
            id
            email
          }
          membership {
            id
            subscriptionId
            pauseRequests(orderBy: createdAt_DESC) {
              id
              pausePending
              resumeDate
              pauseDate
            }
          }
        }`
      )) as any

      const pausePending =
        customerWithData?.membership?.pauseRequests?.[0]?.pausePending

      if (pausePending) {
        console.log("Pending pause: ", customerWithData.user.email)
        const subscriptionId = customerWithData?.membership?.subscriptionId
        paymentService.pauseSubscription(subscriptionId, customer)
      }
    }
  } catch (e) {
    console.log("e", e)
  }
}

const fixPrismaPausedButChargebeeActive = async () => {
  const ps = new PrismaService()
  const utilsService = new UtilsService(ps)
  const admissions = new AdmissionsService(ps, utilsService)
  const emailData = new EmailDataProvider()
  const segment = new SegmentService()
  const paymentUtils = new PaymentUtilsService()
  const shippingUtils = new ShippingUtilsService()
  const emailService = new EmailService(ps, utilsService, emailData)
  const shippingService = new ShippingService(ps, utilsService)
  const pusherService = new PusherService()
  const pushNotificationDataProvider = new PushNotificationDataProvider()
  const pushNotification = new PushNotificationService(
    pusherService,
    pushNotificationDataProvider,
    ps
  )
  const authService = new AuthService(ps, pushNotification, shippingUtils)
  const customerService = new CustomerService(
    authService,
    ps,
    shippingService,
    admissions,
    segment
  )
  const paymentService = new PaymentService(
    authService,
    customerService,
    emailService,
    paymentUtils,
    ps,
    utilsService,
    segment
  )

  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })

  try {
    const customers = await ps.client.customers({
      where: { status: "Paused" },
    })

    for (const customer of customers) {
      const customerWithData = (await ps.binding.query.customer(
        {
          where: { id: customer.id },
        },
        `{
          id
          status
          plan
          user {
            id
          }
        }`
      )) as any

      const planID = customerWithData?.plan
      if (planID) {
        const subscriptions = await chargebee.subscription
          .list({
            plan_id: {
              in: [paymentService.prismaPlanToChargebeePlanId(planID)],
            },
            customer_id: { is: customerWithData?.user.id },
          })
          .request()
        const subscription = head(subscriptions.list) as any
        const status = subscription?.subscription?.status
        if (status === "active") {
          // User shouldn't be active in chargebee and paused in prisma
          paymentService.pauseSubscription(
            subscription.subscription.id,
            customer
          )
          console.log("User has been paused", subscription.customer.email)
        }
      }
    }
  } catch (e) {
    console.log("e", e)
  }
}

updatePausePendingCustomersToBeImmediatelyPaused()
