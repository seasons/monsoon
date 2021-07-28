import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import sgMail from "@sendgrid/mail"

import { AppModule } from "../../app.module"
import { EmailService } from "../../modules/Email/services/email.service"
import { AdmissionsService } from "../../modules/User/services/admissions.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const ps = app.get(PrismaService)
  const emails = app.get(EmailService)
  const admissions = app.get(AdmissionsService)

  const c = await ps.client2.customer.findFirst({
    where: { user: { email: "faiyam+prod2@seasons.nyc" } },
    select: { id: true, user: true },
  })

  const availableStyles = await admissions.getAvailableStyles({
    id: c.id,
  })

  try {
    await emails.sendRecommendedItemsNurtureEmail(c.user, availableStyles)
  } catch (err) {
    console.log(err)
  }
}
run()

run()
