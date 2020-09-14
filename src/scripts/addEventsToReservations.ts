import { head } from "lodash"

import { Package, Reservation, ReservationPhase } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

type ReservationWithPackage = Reservation & {
  sentPackage: Package
  returnedPackage: Package
}

const addEventsToReservations = async () => {
  const ps = new PrismaService()

  const events = await ps.client.packageTransitEvents({
    orderBy: "createdAt_ASC",
  })
  const packages = await ps.client.packages()

  for (const event of events) {
    const { status, subStatus, createdAt } = event
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
            phase
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
        const phase: ReservationPhase =
          reservation.sentPackage.transactionID === transactionID
            ? "BusinessToCustomer"
            : "CustomerToBusiness"

        const updateData = {
          packageEvents: { connect: { id: event.id } },
          phase,
          statusUpdatedAt: new Date(data.trackingStatus.statusDate),
          ...(status === "Delivered"
            ? { receivedAt: new Date(createdAt) }
            : {}),
          ...(status === "Transit" && subStatus === "PackageAccepted"
            ? { shippedAt: new Date(createdAt), shipped: true }
            : {}),
        }

        await ps.client.updateReservation({
          where: { id: reservation.id },
          data: updateData,
        })
      }
    }
  }
}

addEventsToReservations()
