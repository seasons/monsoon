import "module-alias/register"

import chargebee from "chargebee"

import { PrismaService } from "../prisma/prisma.service"
import {
  Customer,
  CustomerMembership,
  CustomerMembershipSubscriptionData,
  PauseRequest,
  User,
} from ".prisma/client"

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
