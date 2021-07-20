import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const reservationReceipts = await ps.client2.reservationReceipt.findMany({
    select: {
      id: true,
      reservation: true,
      items: { select: { id: true, productId: true, product: true } },
      createdAt: true,
    },
  })

  for (let receipt of reservationReceipts) {
    if (!receipt.reservation) {
      continue
    }
    await ps.client2.reservation.update({
      where: {
        id: receipt.reservation.id,
      },
      data: {
        returnedProducts: {
          connect: receipt.items.map(i => ({
            id: i.productId,
          })),
        },
      },
    })
  }
}

run()
