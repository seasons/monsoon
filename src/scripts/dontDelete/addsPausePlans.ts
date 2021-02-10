import "module-alias/register"

import { PaymentPlanCreateInput } from "../../prisma/prisma.binding"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const newPausePlans = [
    {
      data: {
        planID: "pause-1",
        status: "pausePlan",
        name: "Pause 1",
        price: 2500,
        itemCount: 1,
        tier: "Pause",
      } as PaymentPlanCreateInput,
    },
    {
      data: {
        planID: "pause-2",
        status: "pausePlan",
        name: "Pause 2",
        price: 3500,
        itemCount: 2,
        tier: "Pause",
      } as PaymentPlanCreateInput,
    },
    {
      data: {
        planID: "pause-3",
        status: "pausePlan",
        name: "Pause 3",
        price: 4500,
        itemCount: 3,
        tier: "Pause",
      } as PaymentPlanCreateInput,
    },
  ]

  for (const plan of newPausePlans) {
    await ps.client.createPaymentPlan(plan.data)
  }
}

run()
