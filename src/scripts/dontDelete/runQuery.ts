import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.rentalInvoice.updateMany({
    where: {
      membership: { customer: { status: "Deactivated" } },
      status: "ChargeFailed",
    },
    data: { status: "Cancelled" },
  })
  console.log("done")
}
run()
