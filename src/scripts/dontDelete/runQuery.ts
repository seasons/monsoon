import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const a = await ps.client.reservation.findUnique({
    where: { reservationNumber: 558427573 },
    select: {
      sentPackage: {
        select: { id: true, reservationPhysicalProductsOnInboundPackage: true },
      },
      reservationPhysicalProducts: {
        select: {
          id: true,
          physicalProduct: {
            select: {
              seasonsUID: true,
              productVariant: {
                select: { product: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  })
  console.dir(a, { depth: null })
  console.log("done")
}
run()
