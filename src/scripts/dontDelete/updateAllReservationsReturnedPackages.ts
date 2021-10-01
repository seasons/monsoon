import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  // Get all reservations with no returnPackages
  const reservations = await ps.client.reservation.findMany({
    select: {
      id: true,
      returnPackages: true,
      returnedPackage: true,
    },
  })

  const filteredReservations = reservations.filter(
    a => a.returnPackages.length === 0
  )

  const numReservations = filteredReservations.length

  let i = 0
  for (const reservation of filteredReservations) {
    console.log(`${i++} of ${numReservations}`)
    try {
      await ps.client.reservation.update({
        where: { id: reservation.id },
        data: {
          returnPackages: {
            connect: {
              id: reservation?.returnedPackage?.id,
            },
          },
        },
      })
    } catch (err) {
      console.log(err)
    }
  }
  console.log("done")
}
run()
