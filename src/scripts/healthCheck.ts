import { DataScheduledJobs } from "../modules/Cron/services/data.service"
import { AirtableService } from "../modules/Airtable/services/airtable.service"
import { AirtableBaseService } from "../modules/Airtable/services/airtable.base.service"
import { AirtableUtilsService } from "../modules/Airtable/services/airtable.utils.service"
import { PrismaService } from "../prisma/prisma.service"
import { UtilsService } from "../modules/Utils"
import * as Airtable from "airtable"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const run = async () => {
  const ps = new PrismaService()
  const abs = new AirtableBaseService()
  const dj = new DataScheduledJobs(
    new AirtableService(abs, new AirtableUtilsService(abs)),
    ps,
    null,
    new UtilsService(ps)
  )
  try {
    await dj.checkAll()
  } catch (err) {
    console.log(err)
  }
}

run()
