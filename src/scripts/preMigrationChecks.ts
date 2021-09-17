import "module-alias/register"

import chargebee from "chargebee"

import { TimeUtilsService } from "../modules/Utils/services/time.service"
import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const checkPaymentFailureCustomers = async () => {
  /*
    Checks that every customer who SHOULD have a PaymentFailed status in the DB
    DOES have a PaymentStatus in the DB

    Query all subscriptions with an Invoice Status that includes Payment Due or Not Paid
            AND status is not Cancelled

    Find the corresponding customer 
    Confirm that the customer has status PaymentFailed

    (May need to make exceptions for failures on Buy Used/Buy New)
    */

  const allSubscriptions = []

  let offset = "start"
  while (true) {
    let list
    ;({ next_offset: offset, list } = await chargebee.subscription
      .list({
        limit: 100,
        "status[is_not]": "cancelled",
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allSubscriptions.push(...list?.map(a => a.subscription))
    if (!offset) {
      break
    }
  }

  const subsWithDelinquentInvoices = allSubscriptions.filter(
    a => a.due_invoices_count > 0
  )

  let numCorrect = 0
  let problematicCustomers = []
  for (const sub of subsWithDelinquentInvoices) {
    const internalSubData = await ps.client.customerMembershipSubscriptionData.findFirst(
      {
        where: { subscriptionId: sub.id },
        select: {
          membership: {
            select: {
              customer: {
                select: {
                  status: true,
                  id: true,
                  user: { select: { email: true } },
                },
              },
            },
          },
        },
      }
    )

    if (
      internalSubData.membership.customer.status === "PaymentFailed" ||
      internalSubData.membership.customer.user.email ===
        "ross.r.michaels@gmail.com" // known exception
    ) {
      numCorrect++
    } else {
      problematicCustomers.push({
        customer: internalSubData.membership.customer,
        subscription: sub,
      })
    }
  }

  // Report
  console.log(`Delinquent Customers Report ---`)
  console.log(
    `Num Correct: ${numCorrect}. Num problems: ${problematicCustomers.length}`
  )
  if (problematicCustomers.length > 0) {
    console.log(`Details on problems:`)
    console.dir(problematicCustomers, { depth: null })
  }
}

const checkCancelledSubscriptions = async () => {
  /*
  Check that ever customer with a cancelled subscription in Chargebee is
  either Deactivated or Suspended in our system
  */
  // TODO:

  const cancelledSubscriptions = []
  let offset = "start"
  while (true) {
    let list
    ;({ next_offset: offset, list } = await chargebee.subscription
      .list({
        limit: 100,
        "status[is]": "cancelled",
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    cancelledSubscriptions.push(...list?.map(a => a.subscription))
    if (!offset) {
      break
    }
  }

  let numCorrect = 0
  let problematicCustomers = []

  for (const sub of cancelledSubscriptions) {
    const internalSubData = await ps.client.customerMembershipSubscriptionData.findFirst(
      {
        where: { subscriptionId: sub.id },
        select: {
          membership: {
            select: {
              customer: {
                select: {
                  status: true,
                  id: true,
                  user: { select: { email: true } },
                },
              },
            },
          },
        },
      }
    )

    if (!internalSubData?.membership?.customer) {
      continue
    }

    if (
      ["Suspended", "Deactivated", "Paused"].includes(
        internalSubData.membership.customer.status
      )
    ) {
      numCorrect++
    } else {
      problematicCustomers.push({
        customer: internalSubData.membership.customer,
        subscription: sub,
      })
    }
  }

  console.log(`Cancelled Subscriptions Report ---`)
  console.log(
    `Num Correct: ${numCorrect}. Num problems: ${problematicCustomers.length}`
  )
  if (problematicCustomers.length > 0) {
    console.log(`Details on problems:`)
    console.dir(problematicCustomers, { depth: null })
  }
}

checkPaymentFailureCustomers()
checkCancelledSubscriptions()
