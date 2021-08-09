import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const reasons = [
  "Don’t see anything I like",
  "Nothing available in my size",
  "Too expensive",
  "Just wanted to try it out",
]

const run = async () => {
  const ps = new PrismaService()

  let count = 0
  for (const reason of reasons) {
    count++
    console.log("count", count)
    await ps.client2.pauseReason.create({
      data: {
        reason,
      },
    })
  }
}
run()
