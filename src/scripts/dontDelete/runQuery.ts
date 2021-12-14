import "module-alias/register"

import { UniqueArgumentNames } from "graphql/validation/rules/UniqueArgumentNames"
import { uniq } from "lodash"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const rpps = await ps.client.reservationPhysicalProduct.findMany({
    where: {
      status: {
        notIn: ["Lost", "Cancelled", "ReturnProcessed"],
      },
    },
  })

  const resIds = uniq(rpps.map(a => a.reservationId))

  const rentalInvoices = await ps.client.rentalInvoice.findMany({
    where: {
      status: "Draft",
      reservations: {
        some: {
          id: {
            in: resIds,
          },
        },
      },
    },
    select: {
      id: true,
      reservationPhysicalProducts: true,
      billingEndAt: true,
    },
  })

  const noRPPRentalInvoices = rentalInvoices.filter(
    a => a.reservationPhysicalProducts.length === 0
  )
  console.dir(noRPPRentalInvoices, { depth: null })
  console.log(noRPPRentalInvoices.length)
}

run()
