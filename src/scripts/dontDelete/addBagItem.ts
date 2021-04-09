import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const customerID = "ckd0dvr9z0qo3070052yosyy0"

  await ps.client.createBagItem({
    saved: false,
    productVariant: { connect: { id: "ckapliypq5nid0772t89ow1dv" } },
    position: 0,
    status: "Reserved",
    customer: {
      connect: { id: customerID },
    },
  })
}

run()
