import "module-alias/register"

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
    referralLink
    }`
  )
  const customersWithoutReferralLinks = customers.filter(
    a => a.referralLink == null
  )
  const customersWithReferralLinks = customers.filter(
    a => a.referralLink != null
  )
  let allSlashTags = customersWithReferralLinks.map(a => {
    const link = a.referralLink
    return link.replace("szns.co/", "").toLowerCase()
  })

  let count = 0
  let slashTag
  for (const customer of customersWithoutReferralLinks) {
    console.log(`customer ${count} of ${customers.length}`)
    if (count % 10 === 0) {
      // Because of rebrandly rate limiter
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
    try {
      //@ts-ignore
      ;[slashTag, allSlashTags] = getSlashTag(customer, allSlashTags)
      await fetchAndSetCustomerReferralLink(customer.id, slashTag)
    } catch (e) {
      console.log("error in try catch: ", e)
      console.log("error with customer: ", customer.id)
    }
    count += 1
  }
}

const getSlashTag = (customer, allSlashTags) => {
  /*
  Check if the default slash tag is already taken. 

  If it's not, return it along with an updated allSlashTags object

  If it is, keep incrementing the count until we're good
  */
  const firstName = customer.user.firstName.trim().replace(/[^a-z]/gi, "")
  let number = 1
  let slashTag = `${firstName}${number}`.toLowerCase().replace(" ", "")
  while (allSlashTags.includes(slashTag)) {
    number++
    slashTag = `${firstName}${number}`.toLowerCase().replace(" ", "")
  }
  return [slashTag, [...allSlashTags, slashTag]]
}

const fetchAndSetCustomerReferralLink = async (customerId, slashTag) => {
  let linkRequest = {
    destination: "https://www.seasons.nyc/signup?referrer_id=" + customerId,
    domain: { fullName: "szns.co" },
    slashtag: slashTag,
  }

  let requestHeaders = {
    "Content-Type": "application/json",
    apikey: process.env.REBRANDLY_API_KEY,
    workspace: process.env.REBRANDLY_WORKSPACE_ID,
  }

  await request(
    {
      uri: "https://api.rebrandly.com/v1/links",
      method: "POST",
      body: JSON.stringify(linkRequest),
      headers: requestHeaders,
    },
    async (err, response, body) => {
      if (body?.message === "Number of links exceeded") {
        throw new Error(body)
      }
      let link = JSON.parse(body)
      await ps.binding.mutation.updateCustomer({
        data: { referralLink: link.shortUrl },
        where: { id: customerId },
      })
      console.log(`updated customer: ${customerId} with link: ${link.shortUrl}`)
      console.log(body)
    }
  )
}

run()
