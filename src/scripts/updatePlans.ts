import "module-alias/register"

import chargebee from "chargebee"

import { PaymentScheduledJobs } from "../modules/Cron/services/payment.job.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  chargebee.configure({
    site: "seasons-test",
    api_key: "test_fmWkxemy4L3CP1ku1XwPlTYQyJVKajXx",
  })

  const ps = new PrismaService()
  const paymentScheduledJobs = new PaymentScheduledJobs(ps)
  await paymentScheduledJobs.updatePlans()
}

run()
