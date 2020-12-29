import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const phone = require("phone")

const run = async () => {
  const ps = new PrismaService()

  const customers = await ps.binding.query.customers(
    {},
    `{
      id
      detail {
        id
        phoneNumber
      }
  }`
  )

  let numErrors = 0
  for (const cust of customers) {
    const formattedPhone = cust.detail?.phoneNumber?.replace(/-/g, "")
    await ps.client.updateCustomerDetail({
      where: { id: cust.detail?.id },
      data: { phoneNumber: formattedPhone },
    })
  }
  console.log(`numErrors: ${numErrors}. ${numErrors / customers.length}`)
}

run()
