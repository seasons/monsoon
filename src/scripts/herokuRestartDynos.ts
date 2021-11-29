import "module-alias/register"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "../app.module"
import { HerokuJobs } from "../modules/Cron/services/heroku.job.service"

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const job = app.get(HerokuJobs)

  job.restartDynos()
}

run()
