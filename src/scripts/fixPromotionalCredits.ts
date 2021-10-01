import "module-alias/register"

import chargebee from "chargebee"

import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const run = async () => {
  try {
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

    let count = 0
    for (const m of memberships) {
      count++
      console.log("Updating ", count, " of ", memberships.length)
      await chargebee.promotional_credit
        .set({
          customer_id: m.customer.user.id,
          amount: 0,
          description: "Removing promotional credits to only prisma",
        })
        .request()
    }
  } catch (e) {
    console.log("e", e)
  }

  console.log("Updated all chargebee customers")
}
run()
