import "module-alias/register"

import { RentalService } from "../modules/Payment/services/rental.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const rentalService = new RentalService(ps, null, null)

  const invoices = await ps.client.rentalInvoice.findMany({
    where: {
      status: "Draft",
    },
    select: {
      id: true,
      membership: {
        select: {
          customerId: true,
        },
      },
    },
  })

  console.log(`Updating ${invoices.length} invoices`)

  for (let invoice of invoices) {
    try {
      const estimatedTotal = await rentalService.calculateCurrentBalance(
        invoice.membership.customerId,
        {
          upTo: "billingEnd",
        }
      )

      await ps.client.rentalInvoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          estimatedTotal,
        },
      })

      console.log(
        `Updated invoice ${invoice.id}, estimated total: ${(
          estimatedTotal / 100
        ).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}`
      )
    } catch (e) {
      console.error(`Error while updating invoice ${invoice.id}`, e)
    }
  }

  console.log(`Done updating invoices`)
}
run()
