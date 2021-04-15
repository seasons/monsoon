import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const seed = async () => {
  const ps = new PrismaService()

  const queuedReservations = await ps.binding.query.reservations(
    {
      where: { status: "Queued" },
    },
    `{
      id
      products {
          id
          warehouseLocation {
            id
          }
      }
  }`
  )

  for (const r of queuedReservations) {
    const newProducts = r.products
      .filter(a => !!a.warehouseLocation?.id)
      .map(a => ({ id: a.id }))
    await ps.client.updateReservation({
      where: { id: r.id },
      data: { newProducts: { set: newProducts } },
    })
  }
}

seed()
