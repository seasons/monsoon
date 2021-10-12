import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const email = "ryanofcali@yahoo.com"
  const x = await ps.client.customer.findMany({
    where: { status: { in: ["Active", "Paused", "PaymentFailed"] } },
    select: { user: { select: { email: true } } },
  })
  for (const cust of x) {
    console.log(cust.user.email)
  }
}
run()
