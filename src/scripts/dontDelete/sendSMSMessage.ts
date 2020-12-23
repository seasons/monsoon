import "module-alias/register"

import { SMSService } from "../../modules/SMS/services/sms.service"
import { TwilioService } from "../../modules/Twilio/services/twilio.service"
import { TwilioUtils } from "../../modules/Twilio/services/twilio.utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const twilio = new TwilioService()
  const twilioUtils = new TwilioUtils()
  const sms = new SMSService(ps, twilio, twilioUtils)

  const sleep = async ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const u = await ps.client.user({ email: "faiyam+prod2@seasons.nyc" })
  // await sms.sendSMSById({
  //   to: { id: u.id },
  //   renderData: { name: u.firstName },
  //   smsId: "Rewaitlisted",
  // })
  await sms.sendSMSById({
    to: { id: u.id },
    renderData: { name: u.firstName },
    smsId: "TwentyFourHourAuthorizationFollowup",
  })
}

run()
