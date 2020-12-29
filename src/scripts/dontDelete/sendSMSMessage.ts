import "module-alias/register"

import { head } from "lodash"
import moment from "moment"

import { SMSService } from "../../modules/SMS/services/sms.service"
import { TwilioService } from "../../modules/Twilio/services/twilio.service"
import { TwilioUtils } from "../../modules/Twilio/services/twilio.utils.service"
import { PaymentUtilsService } from "../../modules/Utils/services/paymentUtils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const twilio = new TwilioService()
  const twilioUtils = new TwilioUtils()
  const paymentUtils = new PaymentUtilsService(ps)
  const sms = new SMSService(ps, twilio, twilioUtils, paymentUtils)

  const sleep = async ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const u = await ps.client.user({ email: "kaylee-schumm@seasons.nyc" })
  const pauseRequests = await ps.client.pauseRequests({
    where: {
      membership: {
        customer: { user: { id: u.id } },
      },
    },
    orderBy: "createdAt_DESC",
  })
  await sms.sendSMSById({
    to: { id: u.id },
    renderData: {
      name: u.firstName,
      resumeDate: moment(head(pauseRequests).resumeDate).format(
        "dddd, MMMM Do"
      ),
    },
    smsId: "ResumeReminder",
  })
}

run()
