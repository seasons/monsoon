import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import chargebee from "chargebee"

import { AppModule } from "../../app.module"
import { RentalService } from "../../modules/Payment/services/rental.service"
import { ReservationService } from "../../modules/Reservation/services/reservation.service"
import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)
  const r = app.get(RentalService)
  const ps = app.get(PrismaService)
  const timeUtils = app.get(TimeUtilsService)

  const custSelect = { id: true, membership: { select: { id: true } } }

  // TODO: Fill in email
  const email = null
  let c = await ps.client.customer.findFirst({
    where: { user: { email } },
    select: custSelect,
  })
  if (!c.membership) {
    // TODO: Fill in these nulls
    const subscriptionId = null
    const currentTermEnd = new Date(null)
    const currentTermStart = new Date(null)

    c = await ps.client.customer.update({
      where: { id: c.id },
      data: {
        membership: {
          create: {
            subscriptionId,
            plan: { connect: { planID: "access-monthly" } },
            subscription: {
              create: {
                planID: "access-monthly",
                subscriptionId,
                currentTermStart,
                currentTermEnd,
                status: "active",
                planPrice: 2000,
              },
            },
          },
        },
      },
      select: custSelect,
    })
  }
  await r.initDraftRentalInvoice(c.membership.id, "execute")
  console.log("rental invoice created")
  console.dir(
    await ps.client.customer.findFirst({
      where: { user: { email } },
      select: {
        membership: {
          select: {
            rentalInvoices: {
              select: {
                status: true,
                billingStartAt: true,
                billingEndAt: true,
              },
            },
          },
        },
      },
    }),
    { depth: null }
  )
}
run()
