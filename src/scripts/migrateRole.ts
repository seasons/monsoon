import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  for (const user of await ps.client.users()) {
    await ps.client.updateUser({
      where: { id: user.id },
      data: { roles: { set: [user.role] } },
    })
  }
}

run()
