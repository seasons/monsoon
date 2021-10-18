import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const invoiceId = "cktt8xz7s9298q6uvwyrsnrut"
  const x = await ps.client.rentalInvoice.findUnique({
    where: { id: invoiceId },
    select: {
      status: true,
      lineItems: { select: { price: true, name: true, comment: true } },
      membership: { select: { customer: { select: { user: true } } } },
    },
  })
  console.dir(x, { depth: null })
}
run()
