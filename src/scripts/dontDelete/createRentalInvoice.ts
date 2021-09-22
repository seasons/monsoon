import "module-alias/register"

import chargebee from "chargebee"

import { RentalService } from "../../modules/Payment/services/rental.service"
import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()
  const r = new RentalService(ps, timeUtils, null)

  const email = "j@jasonlbaptiste.com"
  const c = await ps.client.customer.findFirst({
    where: { user: { email } },
    select: { membership: { select: { id: true } } },
  })
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
