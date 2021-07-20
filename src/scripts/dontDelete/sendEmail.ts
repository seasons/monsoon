import "module-alias/register"

import sgMail from "@sendgrid/mail"
import { head } from "lodash"

import { EmailService } from "../../modules/Email/services/email.service"
import { EmailUtilsService } from "../../modules/Email/services/email.utils.service"
import { ErrorService } from "../../modules/Error/services/error.service"
import { ImageService } from "../../modules/Image/services/image.service"
import { QueryUtilsService } from "../../modules/Utils/services/queryUtils.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const ps = new PrismaService()
  const utilsService = new UtilsService(ps, new QueryUtilsService(ps))
  const emails = new EmailService(
    ps,
    utilsService,
    new EmailUtilsService(ps, new ErrorService(), new ImageService(ps))
  )

  const u = await ps.client2.user.findUnique({
    where: { email: "okey-ondricka@seasons.nyc" },
  })
  try {
    await emails.sendResumeConfirmationEmail(u)
  } catch (err) {
    console.log(err)
  }
}

run()
