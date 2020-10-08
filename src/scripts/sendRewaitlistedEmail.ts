import "module-alias/register"

import sgMail from "@sendgrid/mail"
import { head } from "lodash"

import { EmailDataProvider } from "../modules/Email/services/email.data.service"
import { EmailService } from "../modules/Email/services/email.service"
import { EmailUtilsService } from "../modules/Email/services/email.utils.service"
import { AdmissionsService } from "../modules/user/services/admissions.service"
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
  const admissions = new AdmissionsService(ps, utilsService)

  const email = ""
  const cust = head(
    await ps.binding.query.customers(
      { where: { user: { email } } },
      `{id user {id email firstName lastName}}`
    )
  ) as any
  await admissions.haveSufficientInventoryToServiceCustomer({ id: cust.id })
  await emails.sendRewaitlistedEmail(cust.user)
}

run()
