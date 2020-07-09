import "module-alias/register"

import * as Airtable from "airtable"

import { DataScheduledJobs } from "../modules/Cron/services/data.job.service"
import { SlackService } from "../modules/Slack/services/slack.service"
import { PrismaService } from "../prisma/prisma.service"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const run = async () => {
  const ps = new PrismaService()
  const dj = new DataScheduledJobs(ps, new SlackService())
  try {
    await dj.airtableToPrismaHealthCheck()
  } catch (err) {
    console.log(err)
  }
}

run()
