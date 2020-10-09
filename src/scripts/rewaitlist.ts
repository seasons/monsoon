import "module-alias/register"

import sgMail from "@sendgrid/mail"
import { head } from "lodash"
import readlineSync from "readline-sync"

import { EmailDataProvider } from "../modules/Email/services/email.data.service"
import { EmailService } from "../modules/Email/services/email.service"
import { EmailUtilsService } from "../modules/Email/services/email.utils.service"
import { SMSService } from "../modules/SMS/services/sms.service"
import { TwilioService } from "../modules/Twilio/services/twilio.service"
import { TwilioUtils } from "../modules/Twilio/services/twilio.utils.service"
import { AdmissionsService } from "../modules/user/services/admissions.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const ps = new PrismaService()
  const utilsService = new UtilsService(ps)
  const emailData = new EmailDataProvider()
  const email = new EmailService(
    ps,
    utilsService,
    emailData,
    new EmailUtilsService(ps)
  )
  const admissions = new AdmissionsService(ps, utilsService)
  const twilio = new TwilioService()
  const twilioUtils = new TwilioUtils()
  const sms = new SMSService(ps, twilio, twilioUtils)

  const sleep = async ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const emails = []

  // const emails = ["faiyam+1@seasons.nyc"]

  for (const em of emails) {
    const cust = head(
      await ps.binding.query.customers(
        { where: { user: { email: em } } },
        `{id user {id email firstName lastName}}`
      )
    ) as any
    const shouldProceed = readlineSync.keyInYN(
      `You are about to send a text message to ${em}. Proceed? y/n. `
    )
    if (!shouldProceed) {
      console.log(`Skipped ${em}\n`)
      return
    }

    await sms.sendSMSMessage({
      to: { id: cust.user.id },
      body: `${cust.user.firstName}, it's Seasons. Your signup window has closed. Due to demand, we've had to give your spot to the next person in line.`,
      mediaUrls: [
        "https://seasons-images.s3.amazonaws.com/email-images/WaitlistedHero.jpg",
      ],
    })

    await sleep(30000)
    await sms.sendSMSMessage({
      to: { id: cust.user.id },
      body: `If you'd still like to obtain a membership, please contact us at membership@seasons.nyc and we'll see if we can acommodate you.`,
    })

    // await admissions.haveSufficientInventoryToServiceCustomer({ id: cust.id })
    // await ps.client.updateManyCustomers({where: {user: {email: em}}, data: {status: "Waitlisted"}})
    // await email.sendRewaitlistedEmail(cust.user)
  }
}

run()
