import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const email = "alexandrahowley@gmail.com"
  const x = await ps.client.customer.findFirst({
    where: { user: { email } },
    select: {
      user: { select: { email: true } },
      membership: {
        select: {
          rentalInvoices: {
            select: { status: true, billingEndAt: true, billingStartAt: true },
          },
        },
      },
    },
  })
  console.dir(x, { depth: null })
}
run()
