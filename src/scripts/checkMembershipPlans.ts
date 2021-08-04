import "module-alias/register"
import { get, head } from "lodash"

import { NestFactory } from "@nestjs/core"
import chargebee from "chargebee"

import { AppModule } from "../app.module"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })
  const app = await NestFactory.createApplicationContext(AppModule)
  const ps = new PrismaService()

  const memberships = await ps.client.customerMembership.findMany({
    select: {
      id: true,
      plan: {
        select: {
          id: true,
        },
      },
      customer: {
        select: {
          id: true,
          status: true,
          user: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })

  let count = 0
  for (const m of memberships) {
    const status = m?.customer?.status
    if (
      !m.plan &&
      (status === "Paused" || status === "PaymentFailed" || status === "Active")
    ) {
      count++

      const userID = m.customer.user.id

      const subscriptions = await chargebee.subscription
        .list({
          customer_id: { is: userID },
        })
        .request()

      const subscription = (head(subscriptions.list) as any)?.subscription

      await ps.client.customerMembership.update({
        where: {
          id: m.id,
        },
        data: {
          plan: {
            connect: {
              planID: subscription.plan_id,
            },
          },
        },
      })
    }
  }
  console.log("count", count)
}
run()
