import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const a = await ps.client.reservation.findUnique({
    where: { reservationNumber: 943308992 },
    select: {
      sentPackage: {
        select: {
          id: true,
          reservationPhysicalProductsOnOutboundPackage: {
            select: { id: true },
          },
        },
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
      rentalInvoices: {
        select: {
          id: true,
          reservationPhysicalProducts: { select: { id: true } },
        },
      },
    },
  })
  console.dir(a, { depth: null })
  console.log("done")
}
run()
