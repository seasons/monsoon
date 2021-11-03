import "module-alias/register"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const email = "sumedh.neni@gmail.com"
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
              lineItems: {
                select: {
                  id: true,
                  price: true,
                  physicalProduct: {
                    select: {
                      productVariant: {
                        select: { product: { select: { name: true } } },
                      },
                    },
                  },
                },
              },
              comment: true,
            },
          },
        },
      },
    },
  })
  console.dir(c, { depth: null })
}
run()
