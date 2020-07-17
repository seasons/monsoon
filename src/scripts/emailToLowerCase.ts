import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

// Updates all users to have a lowercase email address in prisma
const run = async () => {
  const ps = new PrismaService()
  for (const user of await ps.client.users()) {
    await ps.client.updateUser({
      where: { id: user.id },
      data: { email: user.email.toLowerCase() },
    })
  }
}

run()
