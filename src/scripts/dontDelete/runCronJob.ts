import "module-alias/register"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "../../app.module"
import { BillingScheduledJobs } from "../../modules/Cron/services/billing.job.service"

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const job = app.get(BillingScheduledJobs)

  await job.updateCurrentBalanceOnCustomers()
  await job.updateEstimatedTotalOnInvoices()
}

run()
