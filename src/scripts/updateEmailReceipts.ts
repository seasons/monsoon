import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const receiptsToUpdate = await ps.client.emailReceipts({
    where: { emailId: "DaySixAuthorizationFollowup" },
  })

  for (const r of receiptsToUpdate) {
    await ps.client.updateEmailReceipt({
      where: { id: r.id },
      data: { emailId: "DaySevenAuthorizationFollowup" },
    })
  }
}

run()
