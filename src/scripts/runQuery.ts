import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const allProductIds = (await ps.client.products()).map(a => a.id)

  await ps.client.updateManyCustomers({
    where: { status: "Authorized" },
    data: { status: "Waitlisted" },
  })
}

run()
