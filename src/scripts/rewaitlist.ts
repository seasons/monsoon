import "module-alias/register"

import sgMail from "@sendgrid/mail"
import { head } from "lodash"
import moment from "moment"
import readlineSync from "readline-sync"

import { EmailDataProvider } from "../modules/Email/services/email.data.service"
import { EmailService } from "../modules/Email/services/email.service"
import { EmailUtilsService } from "../modules/Email/services/email.utils.service"
import { ErrorService } from "../modules/Error/services/error.service"
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
    new EmailUtilsService(ps, new ErrorService())
  )
  const admissions = new AdmissionsService(ps, utilsService)
  const twilio = new TwilioService()
  const twilioUtils = new TwilioUtils()
  const sms = new SMSService(ps, twilio, twilioUtils)

  const customersToRewaitlist = await ps.binding.query.customers(
    {
      where: {
        AND: [
          { user: { createdAt_lte: new Date(2020, 9, 5) } },
          { status: "Authorized" },
          { authorizedAt: null },
          { user: { email_not_contains: "seasons.nyc" } },
          { user: { email_not_contains: "faiyamrahman.com" } },
          { user: { email_not_contains: "alexisohanian.com" } },
          { user: { email_not_contains: "mylesthompsoncreative@gmail.com" } },
        ],
      },
    },
    // { where: { user: { email_contains: "faiyam" } } },
    `{
      id
    user {
      id
      email
      firstName
      lastName
      emails {
        emailId
        createdAt
      }
      createdAt
    }
    authorizedAt
  }`
  )
  console.log(`${customersToRewaitlist.length} to rewaitlist`)
  const emails = customersToRewaitlist.map(a => a.user.email)
  console.log(emails)
  // const emails = ["faiyam@faiyamrahman.com"]

  let i = 0
  let queue = []
  for (const cust of customersToRewaitlist) {
    if (queue.length > 0) {
      console.log(`rewaitlisting customers: `)
      console.log(queue.map(a => a.user.email))
      await rewaitlistCustomers(admissions, ps, email, sms, queue)
      queue = []
    }

    console.log(`cust ${i++} of ${customersToRewaitlist.length}`)
    const shouldProceed = readlineSync.keyInYN(
      `\nYou are about to rewaitlist ${cust.user.email}.\n` +
        `authorizedAt: ${cust.authorizedAt}\n` +
        `createdAt: ${cust.user.createdAt}\n` +
        `createdAt: ${moment(cust.user.createdAt).format("MMMM Do YYYY")}\n` +
        `emails:\n${cust.user.emails.reduce((acc, curval) => {
          const newString = `${curval.emailId} at ${moment(
            curval.createdAt
          ).format("MMMM Do YYYY")}\n`
          return acc + newString
        }, ``)}\n`
    )

    if (!shouldProceed) {
      console.log(`Skipped ${cust.user.email}\n`)
      continue
    } else {
      queue.push(cust)
    }
  }
  await rewaitlistCustomers(admissions, ps, email, sms, queue)
}

const rewaitlistCustomers = async (admissions, ps, email, sms, customers) => {
  const sleep = async ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  for (const cust of customers) {
    try {
      const availableStyles = await admissions.getAvailableStyles({
        id: cust.id,
      })
      await ps.client.updateManyCustomers({
        where: { id: cust.id },
        data: { status: "Waitlisted" },
      })
      await email.sendRewaitlistedEmail(cust.user, availableStyles)

      await sms.sendSMSMessage({
        to: { id: cust.user.id },
        body: `${cust.user.firstName}, it's Seasons. Your signup window has closed. Due to demand, we've had to give your spot to the next person in line.`,
        mediaUrls: [
          "https://seasons-images.s3.amazonaws.com/email-images/WaitlistedHero.jpg",
        ],
      })
    } catch (err) {
      console.log(cust.user.email)
      console.log(err)
    }
  }

  await sleep(30000)

  for (const cust of customers) {
    try {
      await sms.sendSMSMessage({
        to: { id: cust.user.id },
        body: `If you'd still like to obtain a membership, please contact us at membership@seasons.nyc.`,
      })
    } catch (err) {
      console.log(cust.user.email)
      console.log(err)
    }
  }
}
run()
