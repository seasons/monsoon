import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

// Delete a reserved bag item from a customer's reservation. Do all associated data updates
const run = async () => {
  const ps = new PrismaService()

  const seasonsUID = "OURL-BLU-MM-020-01"
  const reservationNumber = 253662353

  const promises = []
  const custWithData = await ps.client.customer.findFirst({
    where: { reservations: { some: { reservationNumber } } },
    select: {
      user: { select: { email: true } },
      bagItems: {
        where: { physicalProduct: { seasonsUID }, status: "Reserved" },
        select: { id: true, status: true },
        take: 1,
      },
      membership: {
        select: {
          rentalInvoices: {
            orderBy: { createdAt: "desc" },
            take: 1,
            where: { status: "Draft" },
            select: { id: true },
          },
        },
      },
    },
  })

  const bagItemToDelete = custWithData.bagItems[0]
  if (!bagItemToDelete) {
    throw "Check inputs. No reserved bag item found"
  }

  const rentalInvoiceToUpdate = custWithData.membership.rentalInvoices[0]
  if (!rentalInvoiceToUpdate) {
    throw "Check inputs. No current rental invoice for customer"
  }

  // Remove from newProducts. Remove from products
  promises.push(
    ps.client.reservation.update({
      where: { reservationNumber },
      data: {
        newProducts: { disconnect: { seasonsUID } },
        products: { disconnect: { seasonsUID } },
      },
    })
  )

  // Delete bag item
  promises.push(ps.client.bagItem.delete({ where: { id: bagItemToDelete.id } }))

  // Remove from customer rental invoice
  promises.push(
    ps.client.rentalInvoice.update({
      where: { id: rentalInvoiceToUpdate.id },
      data: { products: { disconnect: { seasonsUID } } },
    })
  )

  await ps.client.$transaction(promises)

  console.log(
    `Done. Removed ${seasonsUID} from reservation ${reservationNumber} and updated associated data.`
  )
}
run()
