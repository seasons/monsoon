import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import sgMail from "@sendgrid/mail"
import chargebee from "chargebee"

import { AppModule } from "../../app.module"
import { SubscriptionsScheduledJobs } from "../../modules/Cron/services/subscriptions.job.service"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const run = async () => {
  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })

  const app = await NestFactory.createApplicationContext(AppModule)
  const subscriptionJobs = app.get(SubscriptionsScheduledJobs)
  await subscriptionJobs.handleRentalInvoices()
}

run()
