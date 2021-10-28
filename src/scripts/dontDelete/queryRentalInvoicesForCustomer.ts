import "module-alias/register"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const email = "pl744@nyu.edu"
  const c = await ps.client.customer.findMany({
    where: { user: { email } },
    select: {
      membership: {
        select: {
          rentalInvoices: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              status: true,
              createdAt: true,
              billingEndAt: true,
              billingStartAt: true,
              reservations: { select: { reservationNumber: true } },
              products: { select: { seasonsUID: true } },
            },
          },
        },
      },
    },
  })
  console.dir(c, { depth: null })
}
run()
