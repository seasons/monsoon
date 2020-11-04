import "module-alias/register"

import { DateTime } from "luxon"
import readlineSync from "readline-sync"

import { Customer, CustomerStatus } from "../prisma/prisma.binding"
import { PrismaService } from "../prisma/prisma.service"

process.env.PRISMA_ENDPOINT = "http://localhost:4466/monsoon/dev"
process.env.PRISMA_SECRET =
  "6mFrM3ZRzg1q1JNnY5nHuKdFphquSB6w3WLESaYl3B3H8NzFYSVfuarx5pau8eaJT68rI2XxsSF1wHCf6xbFwuxnOeqxU0d3YFnK"

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

    const authorizationWindowClosesAt = DateTime.fromJSDate(
      new Date(authorizedAt)
    )
      .plus({
        days: 2,
      })
      .toISODate()
    const shouldProceed = readlineSync.keyInYN(
      `You are about to set authorizationWindowClosesAt on ${cust.user.email} to ${authorizationWindowClosesAt}. Proceed? y/n. `
    )

    if (!shouldProceed) {
      console.log(`Skipped ${cust.user.email}\n`)
      continue
    }
    console.log(authorizedAt, cust.id)
    await ps.client.updateCustomer({
      where: { id: cust.id },
      data: {
        authorizedAt,
        // admissions: {
        //   upsert: {
        //     update: {
        //       authorizationWindowClosesAt,
        //     },
        //     create: {
        //       authorizationWindowClosesAt,
        //       admissable: true,
        //       inServiceableZipcode: true,
        //       authorizationsCount: calculateNumAuthorizations(
        //         cust,
        //         "Authorized"
        //       ),
        //     },
        //   },
        // },
      },
    })
  }
}

run()
