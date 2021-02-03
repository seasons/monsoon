import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.updateUser({
    where: {
      id: "ck7ow1pyx058o0732ag31h6f2",
    },
    data: {
      roles: { set: ["Customer", "Admin", "Marketer"] },
    },
  })
}

run()
