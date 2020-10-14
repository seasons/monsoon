import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const allProductIds = (await ps.client.products()).map(a => a.id)

  await ps.client.updateCustomer({
    where: { id: "ckg9ufodu07y70806w62njafb" },
    data: { emailedProducts: { connect: allProductIds.map(a => ({ id: a })) } },
  })
}

run()
