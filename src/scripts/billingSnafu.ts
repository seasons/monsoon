import "module-alias/register"

import * as util from "util"

import sgMail from "@sendgrid/mail"
import * as Airtable from "airtable"
import chargebee from "chargebee"
import { head } from "lodash"

import { AirtableBaseService } from "../modules/Airtable/services/airtable.base.service"
import { AirtableService } from "../modules/Airtable/services/airtable.service"
import { AirtableUtilsService } from "../modules/Airtable/services/airtable.utils.service"
import { EmailDataProvider, EmailService } from "../modules/Email"
import { PaymentUtilsService } from "../modules/Payment"
import { UtilsService } from "../modules/Utils"
import { PrismaService } from "../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEE_API_KEY,
})

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const query = async () => {
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

const fixData = async () => {
  const ps = new PrismaService()
  const paymentUtils = new PaymentUtilsService()
  const abs = new AirtableBaseService()
  const airtableService = new AirtableService(
    abs,
    new AirtableUtilsService(abs)
  )
  const emails = []

  const chargebeeCustomers = []
  for (const email of emails) {
    const existingChargebeeCustomer = head(
      (await chargebee.customer.list({ "email[is]": `${email}` }).request())
        .list
    ) as any
    const subscriptionForCustomer = head(
      (
        await chargebee.subscription
          .list({
            "customer_id[is]": `${existingChargebeeCustomer.customer.id}`,
          })
          .request()
      ).list
    ) as any
    chargebeeCustomers.push({
      ...existingChargebeeCustomer,
      ...subscriptionForCustomer,
    })
  }
  for (const c of chargebeeCustomers) {
    console.log(util.inspect(c, { depth: null }))
  }

  for (const c of chargebeeCustomers) {
    const billingInfo = paymentUtils.createBillingInfoObject(c.card, c.customer)
    const plan = { essential: "Essential", "all-access": "AllAccess" }[
      c.subscription.plan_id
    ]

    // Update prisma
    const prismaCust = head(
      await ps.client.customers({
        where: { user: { email: c.customer.email } },
      })
    ) as any
    await ps.client.updateCustomer({
      where: { id: prismaCust.id },
      data: { plan, status: "Active", billingInfo: { create: billingInfo } },
    })

    // Save it to airtable
    await airtableService.createOrUpdateAirtableUser(
      await ps.client.user({ email: c.customer.email }),
      {
        status: "Active",
        plan,
        billingInfo,
      }
    )
  }

  // Get each users customer data
  // Update their status on prisma, billingInfo, and plan on prisma
  // Update their status, plan, billingInfo on airtable
}

// TODO
const sendWelcome = async () => {
  const ps = new PrismaService()
  const emailService = new EmailService(
    new PrismaService(),
    new UtilsService(ps),
    new EmailDataProvider()
  )
  const emails = []

  for (const email of emails) {
    await emailService.sendWelcomeToSeasonsEmail(
      await ps.client.user({ email })
    )
  }
}

// fixData()
sendWelcome()
