import "module-alias/register"

import chargebee from "chargebee"
import { head } from "lodash"
import { DateTime } from "luxon"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })
  const ps = new PrismaService()

  try {
    const allSubscriptions = []

    let offset = "start"
    while (true) {
      let list
      ;({ next_offset: offset, list } = await chargebee.subscription
        .list({
          limit: 100,
          ...(offset === "start" ? {} : { offset }),
        })
        .request())
      allSubscriptions.push(...list?.map(a => a.subscription))
      if (!offset) {
        break
      }
    }

    for (const subscription of allSubscriptions) {
      const userID = subscription.customer_id
      const customers = await ps.binding.query.customers(
        {
          where: {
            user: { id: userID },
          },
        },
        `
        {
            id
            membership {
                id
                subscription {
                    id
                }
            }
        }
      `
      )
      const customer = head(customers)

      if (!customer) {
        console.log("error no customer")
        return
      }

      const data = {
        nextBillingAt: DateTime.fromSeconds(
          subscription.next_billing_at
        ).toISO(),
        currentTermEnd: DateTime.fromSeconds(
          subscription.current_term_end
        ).toISO(),
        currentTermStart: DateTime.fromSeconds(
          subscription.current_term_start
        ).toISO(),
        status: subscription.status,
        planPrice: subscription.plan_amount,
        subscriptionId: subscription.id,
        planID: subscription.plan_id,
      }

      const membershipSubscriptionID = customer?.membership?.subscription?.id
      if (membershipSubscriptionID) {
        await ps.client.updateCustomerMembershipSubscriptionData({
          where: { id: membershipSubscriptionID },
          data,
        })
      } else {
        const membershipSubscription = (await ps.client.createCustomerMembershipSubscriptionData(
          data
        )) as any

        await ps.client.updateCustomerMembership({
          where: { id: customer.membership.id },
          data: {
            subscription: { connect: { id: membershipSubscription.id } },
          },
        })
      }
    }
  } catch (e) {
    console.log("e", e)
  }
}

run()
