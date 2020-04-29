import "module-alias/register"

import * as Airtable from "airtable"
import { groupBy } from "lodash"

import { AirtableBaseService } from "../modules/Airtable/services/airtable.base.service"
import { AirtableService } from "../modules/Airtable/services/airtable.service"
import { AirtableUtilsService } from "../modules/Airtable/services/airtable.utils.service"
import { PrismaService } from "../prisma/prisma.service"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const duplicateNames = async () => {
  const ps = new PrismaService()
  const abs = new AirtableBaseService()
  const as = new AirtableService(abs, new AirtableUtilsService(abs))

  const allProducts = await as.getAllProducts()
  const groupedByName = groupBy(allProducts, (a) => a.model.name)
  let count = 0
  for (const key of Object.keys(groupedByName)) {
    if (groupedByName[key].length == 2) {
      count++
      console.log(`${key}: ${groupedByName[key].map((a) => a.model.name)}`)
    }
  }
  console.log(`num duplicates: ${count}`)
}

const duplicateSlugs = async () => {
  const ps = new PrismaService()
  const abs = new AirtableBaseService()
  const as = new AirtableService(abs, new AirtableUtilsService(abs))

  const allProducts = await as.getAllProducts()
  const groupedBySlug = groupBy(allProducts, (a) => a.model.slug)
  let count = 0
  for (const key of Object.keys(groupedBySlug)) {
    if (groupedBySlug[key].length == 2) {
      count++
      console.log(`${key}: ${groupedBySlug[key].map((a) => a.model.slug)}`)
    }
  }
  console.log(`num duplicates: ${count}`)
}

duplicateSlugs()
