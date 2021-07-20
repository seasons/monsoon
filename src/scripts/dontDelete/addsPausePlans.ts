import "module-alias/register"

import { PaymentPlanCreateInput } from "../../prisma/prisma.binding"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const newPausePlans = [
    {
      data: {
        planID: "pause-6",
        status: "pausePlan",
        name: "Pause 6",
        price: 7500,
        itemCount: 6,
        tier: "Pause",
      } as PaymentPlanCreateInput,
    },
  ]

  for (const plan of newPausePlans) {
    await ps.client.createPaymentPlan(plan.data)
  }
}

run()
