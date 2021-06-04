import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const customerID = "ck8p84yvk12ei0723jtm0ydu7"

  await ps.client.createBagItem({
    saved: false,
    productVariant: { connect: { id: "ck8apo4tl6ip907921exg98g4" } },
    position: 0,
    status: "Reserved",
    customer: {
      connect: { id: customerID },
    },
  })
}

run()
