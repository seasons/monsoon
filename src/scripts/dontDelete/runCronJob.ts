import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import { Subscription } from "@nestjs/graphql"
import sgMail from "@sendgrid/mail"
import chargebee from "chargebee"

import { AppModule } from "../../app.module"
import { AdmissionsScheduledJobs } from "../../modules/Cron/services/admissions.job.service"
import { LogsScheduledJobs } from "../../modules/Cron/services/logs.job.service"
import { MarketingScheduledJobs } from "../../modules/Cron/services/marketing.job.service"
import { MembershipScheduledJobs } from "../../modules/Cron/services/membership.job.service"
import { ProductScheduledJobs } from "../../modules/Cron/services/product.job.service"
import { ReservationScheduledJobs } from "../../modules/Cron/services/reservations.job.service"
import { ShopifyScheduledJobs } from "../../modules/Cron/services/shopify.job.service"
import { SubscriptionsScheduledJobs } from "../../modules/Cron/services/subscriptions.job.service"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const run = async () => {
  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })

  const app = await NestFactory.createApplicationContext(AppModule)
<<<<<<< HEAD
  const productJobs = app.get(ProductScheduledJobs)
  await productJobs.cacheRentalPrices()
=======
  const scheduleJobService = app.get(MembershipScheduledJobs)
  const subscriptionJobService = app.get(SubscriptionsScheduledJobs)
  await subscriptionJobService.handleRentalInvoices()
>>>>>>> 697b846fafc50f18c3be8c93e1f333f965d6e46d
}

run()
