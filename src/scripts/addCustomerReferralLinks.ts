import "module-alias/register"

import { get } from "lodash"
import request from "request"

import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

const run = async () => {
  const customers = await ps.binding.query.customers(
    {},
    `{
    id
    user {
      firstName
    }
    }`
  )

  const seenFirstNames = {}
  let count = 0

  for (const customer of customers) {
    if (count === 10) {
      // Because of rebrandly rate limiter
      await new Promise(resolve => setTimeout(resolve, 5000))
      count = 0
    }
    try {
      const firstName = customer.user.firstName.trim()
      const appendedNumber: number = (get(seenFirstNames, firstName) ?? 0) + 1
      seenFirstNames[firstName] = appendedNumber
      const slashTag = firstName + appendedNumber.toString()
      fetchAndSetCustomerReferralLink(customer, slashTag)
    } catch (e) {
      console.log("error in try catch: ", e)
      console.log("error with customer: ", customer.id)
    }
    count += 1
  }
}

const fetchAndSetCustomerReferralLink = async (customer, slashTag) => {
  let linkRequest = {
    destination: "https://www.seasons.nyc/signup?referral_id=" + slashTag,
    domain: { fullName: "rebrand.ly" },
    slashtag: slashTag,
  }

  // TODO: Update with seasons values from luc
  let requestHeaders = {
    "Content-Type": "application/json",
    apikey: "281032559ec44bb5bdd7d4ff7f7f2339",
    workspace: "7a7e56a2c493471d859e679fcabbf1cb",
  }

  request(
    {
      uri: "https://api.rebrandly.com/v1/links",
      method: "POST",
      body: JSON.stringify(linkRequest),
      headers: requestHeaders,
    },
    (err, response, body) => {
      let link = JSON.parse(body)
      console.log(
        `Long URL was ${link.destination}, short URL is ${link.shortUrl}`
      )
      ps.binding.mutation.updateCustomer({
        data: { referralLink: link.shortUrl },
        where: { id: customer.id },
      })
    }
  )
}

run()
