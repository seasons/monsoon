import "module-alias/register"

import * as util from "util"

import chargebee from "chargebee"
import { head } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEE_API_KEY,
})

const run = async () => {
  const ps = new PrismaService()

  const authorizedCustomers = await ps.binding.query.customers(
    { where: { status: "Authorized" } },
    `{
       id
       user {
           id
          email
       }
    }`
  )
  //   console.log(authorizedUsers)
  //   console.log(authorizedUsers.length)

  const chargebeeCustomers = []
  for (const cust of authorizedCustomers) {
    const existingChargebeeCustomer = head(
      (
        await chargebee.customer
          .list({ "email[is]": `${cust.user.email}` })
          .request()
      ).list
    )
    if (existingChargebeeCustomer) {
      chargebeeCustomers.push((existingChargebeeCustomer as any).customer.email)
    }
  }
  for (const c of chargebeeCustomers) {
    console.log(util.inspect(c, { depth: null }))
  }
}

run()
