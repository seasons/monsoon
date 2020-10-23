import "module-alias/register"

import Twilio from "twilio/lib/rest/Twilio"

import { SegmentService } from "../modules/Analytics/services/segment.service"
import { AdmissionsScheduledJobs } from "../modules/Cron/services/admissions.job.service"
import { EmailDataProvider } from "../modules/Email/services/email.data.service"
import { EmailService } from "../modules/Email/services/email.service"
import { EmailUtilsService } from "../modules/Email/services/email.utils.service"
import { ErrorService } from "../modules/Error/services/error.service"
import { ImageService } from "../modules/Image/services/image.service"
import { PusherService } from "../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../modules/PushNotification/services/pushNotification.service"
import { ShippingService } from "../modules/Shipping/services/shipping.service"
import { SMSService } from "../modules/SMS/services/sms.service"
import { TwilioService } from "../modules/Twilio/services/twilio.service"
import { TwilioUtils } from "../modules/Twilio/services/twilio.utils.service"
import { AdmissionsService } from "../modules/User/services/admissions.service"
import { AuthService } from "../modules/User/services/auth.service"
import { CustomerService } from "../modules/User/services/customer.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const utils = new UtilsService(ps)
  const as = new AdmissionsService(ps, utils)
  const pusher = new PusherService()
  const pndp = new PushNotificationDataProvider()
  const pn = new PushNotificationService(pusher, pndp, ps)
  const emaildp = new EmailDataProvider()
  const error = new ErrorService()
  const image = new ImageService(ps)
  const emailutils = new EmailUtilsService(ps, error, image)
  const email = new EmailService(ps, utils, emaildp, emailutils)
  const auth = new AuthService(ps, pn, email)
  const shipping = new ShippingService(ps, utils)
  const segment = new SegmentService()
  const twilio = new TwilioService()
  const twilioUtils = new TwilioUtils()
  const sms = new SMSService(ps, twilio, twilioUtils)
  const cs = new CustomerService(
    auth,
    ps,
    shipping,
    as,
    segment,
    email,
    pn,
    sms
  )
  const admissionsJobService = new AdmissionsScheduledJobs(ps, as, cs, error)
  await admissionsJobService.updateAdmissionsFields()
}

run()
