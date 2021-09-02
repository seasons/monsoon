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
            select: {
              id: true,
              events: { select: { id: true } },
              items: { select: { id: true } },
            },
          },
          id: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  const customersToHandle = customers.filter(a => a.reservations.length > 0)
  const numCustomers = customersToHandle.length
  let i = 0
  for (const cust of customersToHandle) {
    console.log(`${i++} of ${numCustomers}`)
    try {
      const latestReservation = cust.reservations[0]
      const previousReservations = cust.reservations.slice(
        1,
        cust.reservations.length
      )
      const previousReservationsWithUnusedReturnPackages = previousReservations.filter(
        a =>
          a.returnedPackage?.events.length === 0 &&
          a.returnedPackage?.items?.length === 0
      )
      const returnPackagesConnectArray = previousReservationsWithUnusedReturnPackages.map(
        a => ({
          id: a.returnedPackage.id,
        })
      )

      const finalCorrectArray = !!latestReservation.returnedPackage?.id
        ? [
            ...returnPackagesConnectArray,
            { id: latestReservation.returnedPackage.id },
          ]
        : returnPackagesConnectArray
      await ps.client.reservation.update({
        where: { id: latestReservation.id },
        data: {
          returnPackages: {
            connect: finalCorrectArray,
          },
        },
      })
      for (const resy of previousReservations) {
        if (!!resy.returnedPackage?.id) {
          await ps.client.reservation.update({
            where: { id: resy.id },
            data: {
              returnPackages: { connect: { id: resy.returnedPackage?.id } },
            },
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
  console.log("done")
}
run()
