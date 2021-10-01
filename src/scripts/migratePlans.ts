import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

const migratePlans = async () => {
  await ps.client.paymentPlan.updateMany({
    where: {},
    data: { tier: "Access" },
  })
  await ps.client.paymentPlan.updateMany({
    where: { planID: { in: ["access-monthly", "access-yearly"] } },
    data: { status: "active" },
  })
  await ps.client.paymentPlan.updateMany({
    where: { status: "active" },
    data: { status: "hidden" },
  })
  console.log("migrating plans done")
}
migratePlans()
