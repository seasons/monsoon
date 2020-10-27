import "module-alias/register"

import sgMail from "@sendgrid/mail"
import { head } from "lodash"

import { EmailDataProvider } from "../../modules/Email/services/email.data.service"
import { EmailService } from "../../modules/Email/services/email.service"
import { EmailUtilsService } from "../../modules/Email/services/email.utils.service"
import { ErrorService } from "../../modules/Error/services/error.service"
import { ImageService } from "../../modules/Image/services/image.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const ps = new PrismaService()
  const utilsService = new UtilsService(ps)
  const emailData = new EmailDataProvider()
  const emails = new EmailService(
    ps,
    utilsService,
    emailData,
    new EmailUtilsService(ps, new ErrorService(), new ImageService(ps))
  )

  const r1 = head(
    await ps.client.reservations({ where: { receivedAt_not: null } })
  )
  console.log(r1)
  const r2 = head(await ps.client.reservations({ where: { receivedAt: null } }))
  console.log(r2)
  await emails.sendReturnReminderEmail(
    await ps.client.user({ email: "faiyam@faiyamrahman.com" }),
    r1
  )
  await emails.sendReturnReminderEmail(
    await ps.client.user({ email: "faiyam@faiyamrahman.com" }),
    r2
  )
}

run()
