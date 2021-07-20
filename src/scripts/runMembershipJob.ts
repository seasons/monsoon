import "module-alias/register"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "../app.module"
import { MembershipScheduledJobs } from "../modules/Cron/services/membership.job.service"

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)

  const scheduleJobService = app.get(MembershipScheduledJobs)
  scheduleJobService.manageMembershipResumes()
}
run()
