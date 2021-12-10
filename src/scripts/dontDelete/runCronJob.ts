import "module-alias/register"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "../../app.module"
import { ReservationProcessingStats } from "../../modules/Cron/services/reservationProcessingStats.job.service"

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const job = app.get(ReservationProcessingStats)

  // await job.updateCurrentBalanceOnCustomers()
  // await job.updateEstimatedTotalOnInvoices()
  await job.getReservationProcessingStats()
}

run()
