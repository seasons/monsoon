import "module-alias/register"

import Mixpanel from "mixpanel"

import { PrismaService } from "../prisma/prisma.service"

const mp = Mixpanel.init("")

const run = async () => {
  const ps = new PrismaService()
  const allUsers = await ps.client.users()
  for (const user of allUsers) {
    await mp.alias(user.email, user.id)
  }
}

run()
