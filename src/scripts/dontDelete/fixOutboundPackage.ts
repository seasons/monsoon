import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const seasonsUID = "HEPR-BLK-SS-005-01"
  const customerId = "ckstgi9es10628102f1kn93bfs2b"

  const r = await ps.client.reservation.findFirst({
    orderBy: { createdAt: "desc" },
    where: {
      newProducts: { some: { seasonsUID } },
      customer: { id: customerId },
    },
    select: {
      reservationNumber: true,
      sentPackage: {
        select: { id: true, items: { select: { seasonsUID: true } } },
      },
    },
  })

  const sentPackageSeasonsUIDs = r.sentPackage.items.map(a => a.seasonsUID)
  if (!sentPackageSeasonsUIDs.includes(seasonsUID)) {
    console.log("update package")
    await ps.client.package.update({
      where: { id: r.sentPackage.id },
      data: { items: { connect: { seasonsUID } } },
    })
  }
  console.log("done")
}
run()
