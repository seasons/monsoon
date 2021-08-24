import "module-alias/register"

import readlineSync from "readline-sync"

import { PrismaService } from "../../prisma/prisma.service"

const duplicates = []
const run = async () => {
  const ps = new PrismaService()

  const numItems = duplicates.length
  let i = 0
  for (const [prodVarId, customerId] of duplicates) {
    const bagItems = await ps.client.bagItem.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        productVariant: { id: prodVarId },
        customer: { id: customerId },
        status: "Added",
      },
      select: {
        saved: true,
        status: true,
        id: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (bagItems.length === 0) {
      continue
    }
    console.log(`${i++} of ${numItems}`)
    console.log(bagItems)
    const shouldProceed = readlineSync.keyInYN("Delete the oldest saved?")

    if (shouldProceed) {
      await ps.client.bagItem.delete({
        where: { id: bagItems.filter(a => a.saved)[0].id },
      })
    }
  }
}
run()
