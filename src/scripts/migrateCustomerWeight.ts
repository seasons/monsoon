import "module-alias/register"

import * as Airtable from "airtable"
import { head } from "lodash"

import { AirtableBaseService } from "../modules/Airtable/services/airtable.base.service"
import { AirtableService } from "../modules/Airtable/services/airtable.service"
import { AirtableUtilsService } from "../modules/Airtable/services/airtable.utils.service"
import { PrismaService } from "../prisma/prisma.service"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const parseWeight = (weight?: string) => {
  const numbers = weight?.match(/\d+/g)?.reduce((accumulator, current) => {
    const n = parseInt(current, 10)
    return n ? [...accumulator, Math.round(n / 10) * 10] : accumulator
  }, [])
  if (numbers?.length === 1) {
    return [numbers[0], numbers[0] + 10]
  } else if (numbers?.length === 2) {
    if (numbers[0] + 10 === numbers[1]) {
      return numbers
    } else {
      return [numbers[0], numbers[0] + 10]
    }
  }

  return null
}

const run = async () => {
  const ps = new PrismaService()
  const abs = new AirtableBaseService()
  const as = new AirtableService(abs, new AirtableUtilsService(abs))

  console.log("Fetching customer details from Airtable...")
  const allUsers = await as.getAllUsers()

  let i = 0
  const total = allUsers.length

  for (const abUser of allUsers) {
    console.log(`${i++} of ${total}`)
    const weight = parseWeight(abUser.model.weight)
    if (!weight) {
      continue
    }

    const email = abUser.model.email
    if (!email) {
      continue
    }

    const psCustomer = head(
      await ps.client.customers({
        where: { user: { email } },
      })
    )
    if (!psCustomer) {
      console.log("Could not find customer with email", email)
      continue
    }

    const psCustomerDetailID = await ps.client
      .customer({ id: psCustomer.id })
      .detail()
      .id()
    if (!psCustomerDetailID) {
      console.log(
        "Could not find customer detail for customer with id",
        psCustomer.id
      )
      continue
    }

    await ps.client.updateCustomerDetail({
      data: {
        weight: { set: weight },
      },
      where: {
        id: psCustomerDetailID,
      },
    })
  }
}

run()
