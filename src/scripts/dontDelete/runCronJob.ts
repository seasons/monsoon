import "module-alias/register"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "../../app.module"
import { BillingScheduledJobs } from "../../modules/Cron/services/billing.job.service"

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const job = app.get(BillingScheduledJobs)

  await job.handleRentalInvoices()

  // await job.updateCurrentBalanceOnCustomers()
  // await job.updateEstimatedTotalOnInvoices()
  // await job.getReservationProcessingStats()
}

run()
