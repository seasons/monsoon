import "module-alias/register"

import sgMail from "@sendgrid/mail"

import { SegmentService } from "../modules/Analytics/services/segment.service"
import { EmailService } from "../modules/Email/services/email.service"
import { EmailUtilsService } from "../modules/Email/services/email.utils.service"
import { ErrorService } from "../modules/Error/services/error.service"
import { ImageService } from "../modules/Image/services/image.service"
import { SMSService } from "../modules/SMS/services/sms.service"
import { TwilioService } from "../modules/Twilio/services/twilio.service"
import { TwilioUtils } from "../modules/Twilio/services/twilio.utils.service"
import { AdmissionsService } from "../modules/user/services/admissions.service"
import { PaymentUtilsService } from "../modules/Utils/services/paymentUtils.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const ps = new PrismaService()
  const utilsService = new UtilsService(ps)
  const image = new ImageService(ps)
  const error = new ErrorService()
  const email = new EmailService(
    ps,
    utilsService,
    new EmailUtilsService(ps, error, image)
  )
  const admissions = new AdmissionsService(ps, utilsService)
  const twilio = new TwilioService()
  const twilioUtils = new TwilioUtils()
  const segment = new SegmentService()
  const paymentUtils = new PaymentUtilsService(ps, segment)
  const sms = new SMSService(
    ps,
    twilio,
    twilioUtils,
    paymentUtils,
    error,
    email
  )
  const emails = [
    "samuelization@hotmail.com",
    "alexandra.corsello@gmail.com",
    "fmusquiz94@gmail.com",
    "emanispencer1250@gmail.com",
    "matthewtimothymurray@gmail.com",
    "manuelebrahem@gmail.com",
    "michael.botefuhr@gmail.com",
    "brockwood23@gmail.com",
    "griffin.elliott777@gmail.com",
    "b.ryce@rocketmail.com",
    "johnsonwyatt22@gmail.com",
    "m.gassner23@gmail.com",
    "julianmarin79@gmail.com",
    "luisito0520@icloud.com",
    "danielchae@gmail.com",
    "grhizer@gmail.com",
    "jason.handman@gmail.com",
    "coltonscheer@yahoo.com",
    "logancsink@icloud.com",
    "dan@arnoff.com",
    "rsacco21@gmail.com",
    "ari101770@gmail.com",
    "cartezl@yahoo.com",
    "tristenatarp@gmail.com",
    "93danielahn@gmail.com",
    "kvnkfr@gmail.com",
    "shahrinbahar@gmail.com",
    "jonathan_gamboa7@yahoo.com",
    "oliviaperdoch@gmail.com",
    "banhbaoshops@gmail.com",
    "brannorris1@gmail.com",
    "themattcingram@gmail.com",
    "jarredgilker@gmail.com",
    "allanfelixsantana@gmail.com",
    "wbdenler@gmail.com",
    "cscotttate@gmail.com",
    "johnkeiran@gmail.com",
    "cisneros_ivane@ymail.com",
    "jayr.sntana@gmail.com",
    "jessica.kleinman1@gmail.com",
    "dannythomp1010@gmail.com",
    "george.navas1@gmail.com",
    "karam.rai22@gmail.com",
    "hipsterelitist@gmail.com",
    "vcwells15@gmail.com",
    "bojie.mageo@gmail.com",
    "leezuspiece@outlook.com",
    "dmlibman@gmail.com",
    "kyreechols@gmail.com",
    "itsthetrumanshow@gmail.com",
    "shweta.katyal@gmail.com",
    "k.e.berger8@gmail.com",
    "austinsimons@me.com",
    "djskee@gmail.com",
    "brandon@wemakemusic.com",
    "greg.e.aldridge@gmail.com",
    "gabrielpatricklavine@gmail.com",
    "akaraambak@gmail.com",
  ]
  const customersToFollowupWith = await ps.binding.query.customers(
    {
      where: {
        AND: [
          { user: { email_in: emails } },
          { status: "Authorized" },
          { user: { email_not_contains: "seasons.nyc" } },
          { user: { email_not_contains: "faiyamrahman.com" } },
          { user: { email_not_contains: "alexisohanian.com" } },
          { user: { email_not_contains: "mylesthompsoncreative@gmail.com" } },
          ,
        ],
      },
      // where: {
      //   AND: [{ status: "Waitlisted" }, { admissions: { admissable: true } }],
      // },
      // where: {
      //   user: { email_contains: "faiyam" },
      // },
    },
    `{
      id
      status
      authorizedAt
      admissions {
        authorizationWindowClosesAt
      }
      user {
        id
        email
        firstName
        emails {
          emailId
        }
      }
    }`
  )
  for (const cust of customersToFollowupWith) {
    const receivedEmails = cust.user.emails.map(a => a.emailId)
    const dayTwoFollowupSent = receivedEmails.includes(
      "DayTwoAuthorizationFollowup"
    )
    const dayThreeFollowupSent = receivedEmails.includes(
      "DayThreeAuthorizationFollowup"
    )
    const daySixFollowupSent =
      receivedEmails.includes("DaySixAuthorizationFollowup") ||
      receivedEmails.includes("TwentyFourHourAuthorizationFollowup") // previous, deprecated email id. Maintain for backwards compatibility.

    const rewaitlistEmailSent = receivedEmails.includes("Rewaitlisted")

    // Day 2 Followup
    // if (!dayTwoFollowupSent) {
    //   await email.sendAuthorizedDayTwoFollowup(cust.user, cust.status)
    //   console.log(`sent ${cust.user.email} day 2 followup`)
    //   continue
    // }

    // // Day 3 Followup
    // if (!dayThreeFollowupSent) {
    //   const availableStyles = await admissions.getAvailableStyles({
    //     id: cust.id,
    //   })
    //   await email.sendAuthorizedDayThreeFollowup(
    //     cust.user,
    //     availableStyles,
    //     cust.status
    //   )
    //   console.log(`sent ${cust.user.email} day 3 followup`)
    //   continue
    // }

    // Day 6 Followup
    if (!daySixFollowupSent) {
      const availableStyles = await admissions.getAvailableStyles({
        id: cust.id,
      })
      await email.sendAuthorizedDaySevenFollowup(cust.user, availableStyles)
      await sms.sendSMSById({
        to: { id: cust.user.id },
        renderData: { name: cust.user.firstName },
        smsId: "TwentyFourHourLeftAuthorizationFollowup",
      })
      console.log(`sent ${cust.user.email} day 7 followup`)
      continue
    }

    // Rewaitlisted
    // if (!rewaitlistEmailSent) {
    //   const availableStyles = await admissions.getAvailableStyles({
    //     id: cust.id,
    //   })
    //   await email.sendRewaitlistedEmail(cust.user, availableStyles)
    //   await sms.sendSMSById({
    //     to: { id: cust.user.id },
    //     renderData: { name: cust.user.firstName },
    //     smsId: "Rewaitlisted",
    //   })
    //   await ps.client.updateCustomer({
    //     where: { id: cust.id },
    //     data: { status: "Waitlisted" },
    //   })
    //   console.log(`rewaitlisted ${cust.user.email}`)
    // }
  }
}
run()
