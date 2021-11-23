import "module-alias/register"

import readlineSync from "readline-sync"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const tu = new TimeUtilsService()

  const rentalInvoices = await ps.client.rentalInvoice.findMany({
    where: {
      status: "Draft",
      membership: {
        NOT: {
          OR: [
            {
              plan: {
                planID: "access-yearly",
              },
            },
            {
              subscription: {
                status: { in: ["non_renewing", "cancelled"] },
              },
            },
          ],
        },
        grandfathered: true,
        customer: {
          status: "Active",
        },
      },
    },
    select: {
      id: true,
      billingEndAt: true,
      membership: {
        select: {
          plan: {
            select: {
              planID: true,
            },
          },
          customer: {
            select: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                },
              },
            },
          },
          subscription: {
            select: {
              nextBillingAt: true,
            },
          },
        },
      },
    },
  })
  console.log(rentalInvoices.length)
  const problems = []
  for (const rentalInvoice of rentalInvoices) {
    console.log(rentalInvoices.indexOf(rentalInvoice))
    const firstName = rentalInvoice.membership.customer.user.firstName
    const email = rentalInvoice.membership.customer.user.email

    if (
      !rentalInvoice.billingEndAt ||
      !rentalInvoice.membership.subscription.nextBillingAt
    ) {
      continue
    }
    const daysBetween = tu.numDaysBetween(
      rentalInvoice.billingEndAt,
      rentalInvoice.membership.subscription.nextBillingAt
    )
    if (daysBetween > 5) {
      continue
    }
    const billingEndAtBeforeNextBillingAt = tu.isLaterDate(
      rentalInvoice.membership.subscription.nextBillingAt,
      rentalInvoice.billingEndAt
    )
    if (billingEndAtBeforeNextBillingAt) {
      const oneDayAfterNextBillingAt = tu.xDaysAfterDate(
        rentalInvoice.membership.subscription.nextBillingAt,
        1,
        "date"
      )
      problems.push({
        ...rentalInvoice,
        daysBetween: daysBetween,
        oneDayAfterNextBillingAt,
      })
    }
  }
  console.log(problems.length)
  let i = 0
  for (const prob of problems) {
    i++
    console.log(`problem ${i} of ${problems.length}`)
    console.dir(prob, { depth: null })
    const shouldProceed = readlineSync.keyInYN("Update the next billingAtDate?")
    if (shouldProceed) {
      await ps.client.rentalInvoice.update({
        where: {
          id: prob.id,
        },
        data: {
          billingEndAt: prob.oneDayAfterNextBillingAt,
        },
      })
    }
  }
}
run()
