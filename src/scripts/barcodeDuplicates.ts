import "module-alias/register"

import * as Airtable from "airtable"

import { AirtableBaseService } from "../modules/Airtable/services/airtable.base.service"
import { AirtableService } from "../modules/Airtable/services/airtable.service"
import { AirtableUtilsService } from "../modules/Airtable/services/airtable.utils.service"
import { PrismaService } from "../prisma/prisma.service"
import { groupBy } from "lodash"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const run = async () => {
  const ps = new PrismaService()
  const abs = new AirtableBaseService()
  const as = new AirtableService(abs, new AirtableUtilsService(abs))

  const allPhysProds = await as.getAllPhysicalProducts()
  const allSequenceNumbers = allPhysProds
    .map(a => parseInt(a.model.sequenceNumber, 10))
    .sort((a, b) => a - b)
  console.log(Math.max(...allSequenceNumbers) + 1)
  console.log(allPhysProds.length + 1)
  const groupedByBarcodes = groupBy(allPhysProds, a => a.model.barcode)
  let count = 0
  for (const key of Object.keys(groupedByBarcodes)) {
    if (groupedByBarcodes[key].length == 2) {
      count++
      console.log(
        `${key}: ${groupedByBarcodes[key].map(a => a.model.sUID.text)}`
      )
    }
  }
  console.log(`num duplicates: ${count}`)
}

run()
