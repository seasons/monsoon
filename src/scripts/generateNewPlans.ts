import "module-alias/register"

import chargebee from "chargebee"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  chargebee.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  })

  const ps = new PrismaService()
  const request = await chargebee.plan.list().request()
  const list = request?.list || []

  list.forEach(async item => {
    if (item?.plan?.id) {
      const data = {
        planID: item.plan.id,
        name: item.plan.name,
        price: item.plan.price,
        status: item.plan.status,
      }

      await ps.client.upsertPaymentPlan({
        where: { planID: item.plan.id },
        create: data,
        update: data,
      })
    }
  })
}

run()
