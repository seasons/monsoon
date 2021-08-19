import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const customers = await ps.client.customer.findMany({
    where: { status: { in: ["Active", "PaymentFailed", "Paused"] } },
    select: {
      reservations: {
        select: {
          returnedPackage: {
            select: { id: true, events: { select: { id: true } } },
          },
          id: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  const customersToHandle = customers.filter(a => a.reservations.length > 0)
  for (const cust of customersToHandle) {
    try {
      const latestReservation = cust.reservations[0]
      const previousReservations = cust.reservations.slice(
        1,
        cust.reservations.length
      )
      const previousReservationsWithUnusedReturnPackages = previousReservations.filter(
        a => a.returnedPackage.events.length === 0
      )
      const returnPackagesConnectArray = previousReservationsWithUnusedReturnPackages.map(
        a => ({
          id: a.returnedPackage.id,
        })
      )
      await ps.client.reservation.update({
        where: { id: latestReservation.id },
        data: {
          returnPackages: {
            connect: returnPackagesConnectArray,
          },
        },
      })
    } catch (err) {
      console.log(err)
    }
  }
}
run()
