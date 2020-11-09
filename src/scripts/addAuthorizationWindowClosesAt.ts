import "module-alias/register"

import { DateTime } from "luxon"
import readlineSync from "readline-sync"

import { Customer, CustomerStatus } from "../prisma/prisma.binding"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const calculateNumAuthorizations = (
    customer: Customer,
    status: CustomerStatus
  ) => {
    const hasExistingAuthorizationsCount =
      typeof customer?.admissions?.authorizationsCount === "number"

    const numCompleteAccountEmails =
      customer.user?.emails?.filter(a => a.emailId === "CompleteAccount")
        ?.length || 0

    const baseline = hasExistingAuthorizationsCount
      ? customer.admissions.authorizationsCount
      : numCompleteAccountEmails

    if (status === "Authorized") {
      return baseline + 1
    }
    return baseline
  }

  const customers = await ps.binding.query.customers(
    {
      where: {
        status: "Authorized",
      },
    },
    `{
      id
      authorizedAt
      admissions {
        id  
      }
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
    if (!cust.admissions?.id) {
      continue
    }
    const authorizedAt = cust.authorizedAt

    const authorizationWindowClosesAt = DateTime.fromJSDate(
      new Date(authorizedAt)
    )
      .plus({
        days: 2,
      })
      .toISO()
    const shouldProceed = readlineSync.keyInYN(
      `You are about to set authorizationWindowClosesAt on ${cust.user.email} to ${authorizationWindowClosesAt}. Proceed? y/n. `
    )

    if (!shouldProceed) {
      console.log(`Skipped ${cust.user.email}\n`)
      continue
    }
    await ps.client.updateCustomer({
      where: { id: cust.id },
      data: {
        admissions: {
          update: {
            authorizationWindowClosesAt,
          },
        },
      },
    })
  }
}

run()
