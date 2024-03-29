import "module-alias/register"

import { head } from "lodash"
import moment from "moment"

import { SegmentService } from "../../modules/Analytics/services/segment.service"
import { ErrorService } from "../../modules/Error/services/error.service"
import { SMSService } from "../../modules/SMS/services/sms.service"
import { TwilioService } from "../../modules/Twilio/services/twilio.service"
import { TwilioUtils } from "../../modules/Twilio/services/twilio.utils.service"
import { PaymentUtilsService } from "../../modules/Utils/services/paymentUtils.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const twilio = new TwilioService()
  const twilioUtils = new TwilioUtils()
  const error = new ErrorService()
  const paymentUtils = new PaymentUtilsService(ps, new SegmentService())
  const utils = new UtilsService(ps)
  const sms = new SMSService(
    ps,
    twilio,
    twilioUtils,
    paymentUtils,
    error,
    null,
    utils
  )

  const sleep = async ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const u = await ps.client.user({ email: "qusheenrush@yahoo.com" })
  // const x = await sms.sendSMSById({
  //   to: { id: u.id },
  //   renderData: {
  //     name: u.firstName,
  //   },
  //   smsId: "Rewaitlisted",
  //   // smsId: "TwentyFourHourLeftAuthorizationFollowup",
  // })
  await sms.sendSMSMessage({
    to: { id: u.id },
    body:
      "Hi Qusheen - This is Seasons. Your membership has an unpaid invoice. Please update your payment information in the app or return the items from your reservation #952253017. Please check your email for more information.",
  })
  // console.log(x)
}

run()
