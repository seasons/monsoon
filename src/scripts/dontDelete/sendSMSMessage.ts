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
  const userIdentifier = { email: "chadmjohnson@gmail.com" }
  await sms.sendSMSMessage({
    to: userIdentifier,
    body: `Chad, it's Seasons. Your 48 hours expires today at 9:51pm. Login and choose a plan to secure your membership: https://szns.co/app. `,
    mediaUrls: [
      "https://seasons-images.s3.amazonaws.com/email-images/AuthorizedHero.jpg",
    ],
  })
  await sleep(15000)
  await sms.sendSMSMessage({
    to: userIdentifier,
    body: `If you need more time, or are having trouble choosing what you'd like for your first reservation, let us know at membership@seasons.nyc and we'll help you find the right first items.`,
  })
}

run()
