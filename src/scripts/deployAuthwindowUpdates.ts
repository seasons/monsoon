import "module-alias/register"

import readlineSync from "readline-sync"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const customers = await ps.binding.query.customers(
    {
      where: {
        AND: [
          // october 5 is 2020 is when we started manually enforcing the auth window
          { user: { createdAt_gte: new Date(2020, 9, 5) } },
          { status: "Authorized" },
        ],
      },
    },
    `{
      id
      authorizedAt
      user {
        id
        email
        firstName
        emails {
          createdAt
          emailId
        }
      }
    }`
  )
  for (const cust of customers) {
    const authorizedAt = cust.user.emails.filter(
      a => a.emailId === "CompleteAccount"
    )?.[0].createdAt
    const shouldProceed = readlineSync.keyInYN(
      `You are about to set authorizedAt on ${cust.user.email} to ${authorizedAt}. Proceed? y/n. `
    )

    if (!shouldProceed) {
      console.log(`Skipped ${cust.user.email}\n`)
      return
    }
    await ps.client.updateCustomer({
      where: { id: cust.id },
      data: { authorizedAt },
    })
  }
}

run()
