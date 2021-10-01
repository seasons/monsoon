import "module-alias/register"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

// Assumes the customer has one reservation and one rental invoice.
// Backdates the rental invoice and reservation timestamps,
// and marks the reservation as delivered so we can test billing
const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const userEmail = "langston.williams24@gmail.com"
  const custWithData = (await ps.client.customer.findFirst({
    where: { user: { email: userEmail } },
    select: {
      reservations: {
        take: 1,
        select: { id: true },
        orderBy: { createdAt: "desc" },
        where: { status: { notIn: ["Completed", "Cancelled", "Lost"] } },
      },
      membership: {
        select: { rentalInvoices: { take: 1, select: { id: true } } },
      },
    },
  })) as any

  // Backdate the reservation. Mark it as Delivered
  await ps.client.reservation.update({
    where: { id: custWithData.reservations[0].id },
    data: {
      status: "Delivered",
      phase: "BusinessToCustomer",
      createdAt: timeUtils.xDaysBeforeDate(new Date(), 6),
    },
  })

  // Update the rental invoice billing start and end dates
  await ps.client.rentalInvoice.update({
    where: { id: custWithData.membership.rentalInvoices[0].id },
    data: {
      billingStartAt: timeUtils.xDaysBeforeDate(new Date(), 6),
      billingEndAt: new Date(),
    },
  })

  console.log("done")
}

run()
