import "module-alias/register"

import sgMail from "@sendgrid/mail"
import chargebee from "chargebee"

import { SegmentService } from "../../modules/Analytics/services/segment.service"
import { AdmissionsScheduledJobs } from "../../modules/Cron/services/admissions.job.service"
import { MarketingScheduledJobs } from "../../modules/Cron/services/marketing.job.service"
import { MembershipScheduledJobs } from "../../modules/Cron/services/membership.job.service"
import { ReservationScheduledJobs } from "../../modules/Cron/services/reservations.job.service"
import { SubscriptionsScheduledJobs } from "../../modules/Cron/services/subscriptions.job.service"
import { DripService } from "../../modules/Drip/services/drip.service"
import { DripSyncService } from "../../modules/Drip/services/dripSync.service"
import { EmailService } from "../../modules/Email/services/email.service"
import { EmailUtilsService } from "../../modules/Email/services/email.utils.service"
import { ErrorService } from "../../modules/Error/services/error.service"
import { ImageService } from "../../modules/Image/services/image.service"
import { PaymentService } from "../../modules/Payment/services/payment.service"
import { PusherService } from "../../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../../modules/PushNotification/services/pushNotification.service"
import { ShippingService } from "../../modules/Shipping/services/shipping.service"
import { SMSService } from "../../modules/SMS/services/sms.service"
import { TwilioService } from "../../modules/Twilio/services/twilio.service"
import { TwilioUtils } from "../../modules/Twilio/services/twilio.utils.service"
import { AdmissionsService } from "../../modules/User/services/admissions.service"
import { AuthService } from "../../modules/User/services/auth.service"
import { CustomerService } from "../../modules/User/services/customer.service"
import { PaymentUtilsService } from "../../modules/Utils/services/paymentUtils.service"
import { StatementsService } from "../../modules/Utils/services/statements.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const run = async () => {
  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })

  const error = new ErrorService()
  const ps = new PrismaService()
  const utils = new UtilsService(ps)
  const as = new AdmissionsService(ps, utils)
  const pusher = new PusherService()
  const pndp = new PushNotificationDataProvider()
  const pn = new PushNotificationService(pusher, pndp, ps, error)

  let payment
  const image = new ImageService(ps)
  const emailutils = new EmailUtilsService(ps, error, image)
  const email = new EmailService(ps, utils, emailutils)
  let auth = new AuthService(ps, pn, email, error, utils, payment)
  const segment = new SegmentService()
  const twilio = new TwilioService()
  const twilioUtils = new TwilioUtils()
  const paymentUtils = new PaymentUtilsService(ps, segment)
  const sms = new SMSService(
    ps,
    twilio,
    twilioUtils,
    paymentUtils,
    error,
    email
  )
  const shipping = new ShippingService(ps, utils)
  const cs = new CustomerService(
    auth,
    ps,
    shipping,
    as,
    segment,
    email,
    pn,
    sms,
    utils
  )
  payment = new PaymentService(
    shipping,
    auth,
    cs,
    email,
    paymentUtils,
    ps,
    utils,
    segment,
    error
  )
  const admissionsJobService = new AdmissionsScheduledJobs(ps, as, cs, error)
  const reservationsJobService = new ReservationScheduledJobs(
    email,
    ps,
    error,
    pn,
    utils
  )
  const dripService = new DripService()
  const dss = new DripSyncService(dripService, ps, utils, error)
  const statements = new StatementsService(ps)
  const marketingJobService = new MarketingScheduledJobs(
    dss,
    ps,
    email,
    as,
    sms
  )
  const membershipService = new MembershipScheduledJobs(
    ps,
    paymentUtils,
    email,
    sms,
    utils,
    statements,
    error
  )
  // await reservationsJobService.sendReturnNotifications()
  // await marketingJobService.syncUnsubscribesFromDrip()
  // await marketingJobService.syncCustomersToDrip()
  await membershipService.updatePausePendingToPaused()
}

run()
