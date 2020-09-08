import { head } from "lodash"

import { Package, Reservation } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

type ReservationWithPackage = Reservation & {
  sentPackage: Package
  returnedPackage: Package
}

const addEventsToReservations = async () => {
  const ps = new PrismaService()

  const events = await ps.client.packageTransitEvents()
  const packages = await ps.client.packages()

  for (const event of events) {
    const { data } = event.data
    if (data.trackingNumber.includes("TEST")) {
      continue
    }
    const { transaction } = data

    const correspondingPackage = packages.find(a => {
      return a.transactionID === transaction
    })

    if (correspondingPackage) {
      await ps.client.updatePackage({
        where: { id: correspondingPackage.id },
        data: {
          events: {
            connect: { id: event.id },
          },
        },
      })
      const transactionID = correspondingPackage.transactionID
      const reservation: ReservationWithPackage = head(
        await ps.binding.query.reservations(
          {
            where: {
              OR: [
                {
                  sentPackage: {
                    transactionID,
                  },
                },
                {
                  returnedPackage: {
                    transactionID,
                  },
                },
              ],
            },
          },
          `{
            id
            status
            sentPackage {
              transactionID
            }
            returnedPackage {
              transactionID
            }
        }`
        )
      )

      if (reservation) {
        const phase =
          reservation.sentPackage.transactionID === transactionID
            ? "BusinessToCustomer"
            : "CustomerToBusiness"

        await ps.client.updateReservation({
          where: { id: reservation.id },
          data: {
            packageEvents: { connect: { id: event.id } },
            phase,
          },
        })
      }
    }
  }
}

addEventsToReservations()
