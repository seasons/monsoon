import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.rentalInvoice.create({
    data: {
      status: "Draft",
      billingStartAt: new Date(),
      billingEndAt: new Date(2021, 11, 26),
      membership: { connect: { id: "cku2yrfmt325712euj5safcueo" } },
    },
  })
  console.log("done")
}
run()
