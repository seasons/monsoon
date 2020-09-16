import "module-alias/register"

import chargebee from "chargebee"
import { head } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })
  const ps = new PrismaService()

  const customers = await ps.client.customers({
    where: { OR: [{ status: "Active" }, { status: "Paused" }] },
  })
  const essential3Plan = head(
    await ps.client.paymentPlans({
      where: { planID: "essential" },
    })
  )
  const allAccess3Plan = head(
    await ps.client.paymentPlans({
      where: { planID: "all-access" },
    })
  )

  for (const customer of customers) {
    try {
      const customerWithData = (await ps.binding.query.customer(
        { where: { id: customer.id } },
        `{
            id
            plan
            membership {
                id    
                subscriptionId
            }
            user {
              id
              email
            }
        }`
      )) as any

      const existingMembershipID = customerWithData?.membership?.id
      let plan
      if (customerWithData.plan === "AllAccess") {
        plan = allAccess3Plan
      } else if (customerWithData.plan === "Essential") {
        plan = essential3Plan
      }

      let subscriptionId
      if (customerWithData?.membership?.subscriptionId) {
        subscriptionId = customerWithData?.membership?.subscriptionId
      } else if (customerWithData.plan) {
        const subscriptions = await chargebee.subscription
          .list({
            plan_id: { in: [customerWithData.plan] },
            customer_id: { is: customerWithData.user.id },
          })
          .request()

        const subscription = head(subscriptions.list) as any

        subscriptionId = subscription?.subscription?.id
      } else {
        console.log("Error no plan data for: ", customer.id)
      }
      if (!subscriptionId) {
        console.log("no subscriptionId for: ", customer.id)
      }

      if (plan) {
        if (!!existingMembershipID) {
          await ps.client.updateCustomerMembership({
            where: { id: existingMembershipID },
            data: {
              plan: { connect: { id: plan.id } },
              subscriptionId: subscriptionId || "",
            },
          })
        } else {
          await ps.client.createCustomerMembership({
            customer: { connect: { id: customer.id } },
            plan: { connect: { id: plan.id } },
            subscriptionId: subscriptionId || "",
          })
        }
      }
    } catch (e) {
      console.log("error in try catch: ", e)
      console.log("error with customer: ", customer.id)
    }
  }
}

run()
