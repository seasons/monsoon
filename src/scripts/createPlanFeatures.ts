import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import { PaymentPlanTier } from "@prisma/client"
import { head } from "lodash"

import { AppModule } from "../app.module"
import { ReservationService } from "../modules/Reservation/services/reservation.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const newPlans = [
    {
      planID: "access-monthly",
      status: "active",
      name: "Monthly",
      caption: "3-month minimum",
      price: 2500,
      tier: "Access",
    },
    {
      planID: "access-yearly",
      status: "active",
      name: "Yearly",
      caption: "Receive a welcome gift",
      price: 24000,
      tier: "Access",
    },
  ]

  for (const p of newPlans) {
    await ps.client.paymentPlan.create({
      data: {
        planID: p.planID,
        status: p.status,
        name: p.name,
        caption: p.caption,
        price: p.price,
        tier: p.tier as PaymentPlanTier,
      },
    })
  }

  console.log("finished")
}

run()
