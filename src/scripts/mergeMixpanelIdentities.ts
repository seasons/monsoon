import "module-alias/register"

import Mixpanel from "mixpanel"

import { PrismaService } from "../prisma/prisma.service"

const mp = Mixpanel.init("e7013b434381fa3ba2f55188e0f07443")

const run = async () => {
  const ps = new PrismaService()
  const allUsers = await ps.client.users()
  let numUsers = allUsers.length
  let i = 0
  for (const user of allUsers) {
    // if (i++ >= 1) {
    //   break
    // }
    console.log(`${i++} of ${numUsers}`)
    console.log(`aliasing ${user.email} to ${user.id}`)
    await mp.alias(user.email, user.id)
  }
}

run()
