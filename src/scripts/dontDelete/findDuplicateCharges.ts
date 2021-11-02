import "module-alias/register"

import chargebee from "chargebee"
import { uniq } from "lodash"

import { PrismaService } from "../../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const handle = (err, result) => {
  if (err) {
    return err
  }
  if (result) {
    return result
  }
}

const run = async () => {
  const ps = new PrismaService()

  const allInvoices = []

  let offset = "start"
  while (true) {
    let list
    ;({ next_offset: offset, list } = await chargebee.invoice
      .list({
        limit: 100,
        "paid_at[after]": "1632096000",
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allInvoices.push(...list?.map(a => a.invoice))
    if (!offset) {
      break
    }
  }
  const problems = []
  for (const invoice of allInvoices) {
    const lineItemNames = invoice.line_items.map(a => a.description)
    const uniqueLineItemNames = uniq(lineItemNames)
    if (lineItemNames.length !== uniqueLineItemNames.length) {
      problems.push(invoice)
    }
  }

  console.dir(problems, { depth: null })
}
/*
  Create an export request
  Keep retrieving it until its done
  Download the csvs from the url
  Create a payload of just customer ids and emails
  Sync it to chargebee (first 2 for now)
  */

// console.dir(data, { depth: null })

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

run()
