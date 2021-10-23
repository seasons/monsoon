import "module-alias/register"

import chargebee from "chargebee"
import { groupBy, orderBy } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

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

  const allPromotionalCredits = []
  let offset = "start"
  while (true) {
    sleep(1000)
    let list
    ;({ next_offset: offset, list } = await chargebee.promotional_credit
      .list({
        limit: 100,
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allPromotionalCredits.push(...list?.map(a => a.promotional_credit))
    if (!offset) {
      break
    }
  }

  const creditsGroupedByChargebeeCustomerId = groupBy(
    allPromotionalCredits,
    a => a.customer_id
  )

  const flags = []
  for (const chargebeeCustomerId of Object.keys(
    creditsGroupedByChargebeeCustomerId
  )) {
    const credits = creditsGroupedByChargebeeCustomerId[chargebeeCustomerId]
    const sortedCredits = orderBy(credits, ["created_at", "desc"])
    const sortedCreditDescriptions = sortedCredits.map(a => a.description)
    let lastDescription = null

    // flag if two descriptions in a row are the same
    for (const description of sortedCreditDescriptions) {
      if (
        description
          .toLowerCase()
          .includes("grandfathered access-yearly credits") ||
        description
          .toLowerCase()
          .includes("grandfathered access-monthly credits")
      ) {
        flags.push({
          failureMode: "Credits may have been given to access customer",
          id: chargebeeCustomerId,
        })
        break
      }

      if (lastDescription === description) {
        flags.push({
          failureMode: "Credits may have been given to access customer",
          id: chargebeeCustomerId,
        })
        break
      } else {
        lastDescription = description
      }
    }

    // flag if grandfathered credits applying to access-monthly or access-yearly customers
  }

  const knownNonFlags = [
    "cksq66als339522fwvbhchva94",
    "ck68f2mxrltgl0777a3vnfx8z",
    "ck8p84yrm12dz07230kyeggwq",
  ]

  const knownToBeInProcess = [
    "ckolp71vl1uvf0720o5150qsm", // Scott Baretta
  ]

  const filteredFlags = flags
    .filter(a => !knownNonFlags.includes(a.id))
    .filter(b => !knownToBeInProcess.includes(b.id))
  for (const flag of filteredFlags) {
    console.log(
      `https://seasons.chargebee.com/customers?view_code=all&Customers.search=${flag.id}`,
      flag.failureMode
    )
  }

  console.log("func complete")
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

run()

/*
FAILURE MODES AND CORRECTION STEPS

:: Customer switched to access-yearly and was incorrectly granted promotional credits
    -> Remove all undue credits from Chargebee without adding back to prisma
    -> If credits have been applied towards an invoice already, charge them for that invoice
*/

/*
TODO: Add a failure mode for more credits having been applied than should have ever been created. Case study: Scott Baretta. 
*/
