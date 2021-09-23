import "module-alias/register"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const email = "vena-wisozk@seasons.nyc"
  const c = await ps.client.customer.findFirst({
    where: { user: { email } },
    select: {
      membership: {
        select: {
          rentalInvoices: {
            orderBy: { createdAt: "asc" },
            select: {
              status: true,
              createdAt: true,
              billingEndAt: true,
              billingStartAt: true,
              reservations: { select: { reservationNumber: true } },
            },
          },
        },
      },
    },
  })
  console.dir(c, { depth: null })
}
run()
