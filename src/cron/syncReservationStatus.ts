import { getAllReservations } from "../airtable/utils"
import {
  prisma,
  ID_Input,
  User,
  ReservationStatus,
  Prisma,
  Reservation,
  Product,
} from "../prisma"
import {
  sendTransactionalEmail,
  calcShipmentWeightFromProductVariantIDs,
} from "../utils"
import { db } from "../server"

// Set up Sentry, for error reporting
const Sentry = require("@sentry/node")
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

export async function syncReservationStatus(event, context, callback) {
  const updatedReservations = []
  const errors = []
  const reservationsInAirtableButNotPrisma = []
  const allAirtableReservations = await getAllReservations()

  for (let airtableReservation of allAirtableReservations) {
    try {
      const prismaReservation = await getPrismaReservationWithNeededFields(
        airtableReservation.fields.ID
      )

      // If the reservation has status of "Completed", handle it seperately.
      if (airtableReservation.fields.Status === "Completed") {
        if (!!prismaReservation) {
          if (prismaReservation.status !== "Completed") {
            // Handle housekeeping
            updatedReservations.push(prismaReservation.reservationNumber)
            const prismaUser = await prisma.user({
              email: airtableReservation.fields["User Email"][0],
            })

            // Update the status
            // await prisma.updateReservation({
            //   data: { status: "Completed" },
            //   where: { id: prismaReservation.id },
            // })

            // Update the user's bag
            await updateUsersBagOnCompletedReservation(
              prisma,
              prismaReservation
            )

            // Email the user
            sendYouCanNowReserveAgainEmail(prismaUser)

            // Update the returnPackage on the shipment
            await updateReturnPackageOnCompletedReservation(
              prisma,
              prismaReservation
            )
          }
        } else {
          reservationsInAirtableButNotPrisma.push(airtableReservation.fields.ID)
          Sentry.captureMessage(
            `completeReservations encountered a reservation in airtable but not prisma` +
              `: ${JSON.stringify(airtableReservation)} `
          )
        }
      } else if (
        airtableReservation.fields.Status !== prismaReservation.status
      ) {
        // If the reservation doesn't have a status of "Completed", just check to
        // see if we need to update the prisma reservation status and do so if needed
        updatedReservations.push(prismaReservation.reservationNumber)
        await prisma.updateReservation({
          data: {
            status: airtableToPrismaReservationStatus(
              airtableReservation.fields.Status
            ),
          },
          where: { id: prismaReservation.id },
        })
      }
    } catch (err) {
      console.log(err)
      errors.push(err)
      Sentry.captureException(err)
    }
  }

  console.log({
    updatedReservations,
    errors,
    reservationsInAirtableButNotPrisma,
  })
  return {
    updatedReservations,
    errors,
    reservationsInAirtableButNotPrisma,
  }
}

syncReservationStatus(null, null, null)

function sendYouCanNowReserveAgainEmail(user: User) {
  sendTransactionalEmail(user.email, "d-528db6242ecf4c0d886ea0357b363052", {})
}

async function getPrismaReservationWithNeededFields(reservationNumber) {
  const res = await db.query.reservation(
    {
      where: { reservationNumber },
    },
    `{ 
        id
        status
        reservationNumber
        products {
            id
            inventoryStatus
            productVariant {
                id
            }
        }
        customer {
            bag {
                id
            }
        }
        returnedPackage {
            id
        }
    }`
  )
  //   console.log(`reservation ${reservationNumber}: ${JSON.stringify(res)}`)
  return res
}

function airtableToPrismaReservationStatus(
  airtableStatus: string
): ReservationStatus {
  return airtableStatus.replace(" ", "") as ReservationStatus
}

async function updateUsersBagOnCompletedReservation(
  prisma: Prisma,
  prismaReservation: any // actually a Prisma Reservation with fields specified in getPrismaReservationWithNeededFields
) {
  const stillHeldPhysicalProductsIDs: {
    id: ID_Input
  }[] = prismaReservation.products
    .filter(p => p.inventoryStatus === "Reserved")
    .map(p => {
      return { id: p.id }
    })
  await prisma.updateBag({
    data: {
      heldItems: {
        connect: stillHeldPhysicalProductsIDs,
      },
    },
    where: { id: prismaReservation.customer.bag.id },
  })
}

async function updateReturnPackageOnCompletedReservation(
  prisma: Prisma,
  prismaReservation: any // actually a Prisma Reservation with fields specified in getPrismaReservationWithNeededFields
) {
  const returnedPhysicalProductIDs: {
    id: ID_Input
  } = prismaReservation.products
    .filter(p => p.inventoryStatus === "Reservable")
    .map(p => {
      return { id: p.id }
    })
  const returnedProductVariantIDs: string[] = prismaReservation.products
    .filter(p => p.inventoryStatus === "Reservable")
    .map(prod => prod.productVariant.id)
  const weight = await calcShipmentWeightFromProductVariantIDs(
    prisma,
    returnedProductVariantIDs
  )
  await prisma.updatePackage({
    data: {
      items: { connect: returnedPhysicalProductIDs },
      weight,
    },
    where: { id: prismaReservation.returnedPackage.id },
  })
}
