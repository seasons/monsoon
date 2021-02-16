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

  let subscription
  let customer
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

    console.log("subscriptions", allSubscriptions.length)

    for (subscription of allSubscriptions) {
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
      customer = head(customers)

      if (!customer) {
        console.log("error no customer", subscription.id, userID)
      } else {
        const data = {
          nextBillingAt: !!subscription.next_billing_at
            ? DateTime.fromSeconds(subscription.next_billing_at).toISO()
            : null,
          currentTermEnd: DateTime.fromSeconds(
            subscription.current_term_end
          ).toISO(),
          currentTermStart: DateTime.fromSeconds(
            subscription.current_term_start
          ).toISO(),
          status: subscription.status,
          planPrice: subscription.plan_amount,
          subscriptionId: subscription.id,
          planID: subscription.plan_id.replace("-gift", ""),
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

          let membershipId = customer.membership?.id
          if (!membershipId) {
            const newMembership = await ps.client.createCustomerMembership({
              subscriptionId: subscription.id,
              plan: { connect: { planID: subscription.plan_id } },
              customer: { connect: { id: customer.id } },
            })
            membershipId = newMembership.id
          }

          await ps.client.updateCustomerMembership({
            where: { id: membershipId },
            data: {
              subscription: { connect: { id: membershipSubscription.id } },
            },
          })
        }
      }
    }
  } catch (e) {
    console.log("e", e, customer, subscription)
  }
}

run()
