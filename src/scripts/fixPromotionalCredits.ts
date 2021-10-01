import "module-alias/register"

import chargebee from "chargebee"

import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const run = async () => {
  const memberships = await ps.client.customerMembership.findMany({
    where: { grandfathered: true },
    select: {
      customer: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })

  for (const m of memberships) {
    await chargebee.promotional_credit
      .set({
        customer_id: m.customer.user.id,
        amount: 0,
      })
      .request()
  }

  console.log("Updated all chargebee customers")
}
run()
