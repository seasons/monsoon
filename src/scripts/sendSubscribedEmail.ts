import "module-alias/register"

import sgMail from "@sendgrid/mail"
import * as Airtable from "airtable"

import { EmailDataProvider } from "../modules/Email/services/email.data.service"
import { EmailService } from "../modules/Email/services/email.service"
import { EmailUtilsService } from "../modules/Email/services/email.utils.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const ps = new PrismaService()
  const utilsService = new UtilsService(ps)
  const emailData = new EmailDataProvider()
  const emails = new EmailService(
    ps,
    utilsService,
    emailData,
    new EmailUtilsService(ps)
  )

  // essential 3
  await emails.sendSubscribedEmail(
    await ps.client.user({ id: "ckbazoe9nbm1q0736bz2ibqwq" })
  )

  //   all-access 2
  await emails.sendSubscribedEmail(
    await ps.client.user({ id: "ckfd9n79h04mb07721m7n5wvm" })
  )

  // essential 1
  await emails.sendSubscribedEmail(
    await ps.client.user({ id: "ckfegqw9s05eo0770j3vkisne" })
  )
}

run()
