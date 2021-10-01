import "module-alias/register"

import chargebee from "chargebee"

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

  console.log("func complete")
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
