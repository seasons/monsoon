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
          plan: {
            planID: "access-yearly",
          },
          subscription: {
            status: { in: ["non_renewing", "cancelled"] },
          },
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
    if (daysBetween > 1 && billingEndAtBeforeNextBillingAt) {
      const oneDayAfterNextBillingAt = tu.xDaysAfterDate(
        rentalInvoice.membership.subscription.nextBillingAt,
        1
      )
      console.dir(
        {
          ...rentalInvoice,
          daysBetween: daysBetween,
          oneDayAfterNextBillingAt,
        },
        { depth: null }
      )
      const shouldProceed = readlineSync.keyInYN(
        "Update the next billingAtDate?"
      )
      if (shouldProceed) {
        await ps.client.rentalInvoice.update({
          where: {
            id: rentalInvoice.id,
          },
          data: {
            billingEndAt: oneDayAfterNextBillingAt,
          },
        })
      }
    }
  }
}
run()
