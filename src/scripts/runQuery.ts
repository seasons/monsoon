import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.updateManyCustomers({
    where: { status: "Authorized" },
    data: { status: "Waitlisted" },
  })
}

run()
