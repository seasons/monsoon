import { getAllReservations } from "../airtable/utils"
import { prisma, ID_Input } from "../prisma"
import { sendTransactionalEmail } from "../utils"
import { db } from "../server"
import Sentry from "@sentry/node"

// Set up Sentry, for error reporting
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

export async function completeReservations(event, context, callback) {
  const updatedReservations = []
  const errors = []
  const reservationsInAirtableButNotPrisma = []
  const allAirtableReservations = await getAllReservations()

  for (let airtableReservation of allAirtableReservations) {
    try {
      if (airtableReservation.fields.Status === "Completed") {
        const prismaReservation = await getPrismaReservationWithNeededFields(
          airtableReservation.fields.ID
        )

        if (!!prismaReservation) {
          if (prismaReservation.status !== "Completed") {
            // Handle housekeeping
            updatedReservations.push(prismaReservation.reservationNumber)
            const prismaUser = await prisma.user({
              email: airtableReservation.fields["User Email"],
            })

            // Update the status
            prisma.updateReservation({
              data: { status: "Completed" },
              where: { id: prismaReservation.id },
            })

            // Update the user's bag
            const stillHeldPhysicalProductsIDs: {
              id: ID_Input
            }[] = prismaReservation.products
              .filter(p => p.inventoryStatus === "Reserved")
              .map(p => {
                id: p.id
              })
            await prisma.updateBag({
              data: {
                heldItems: {
                  connect: stillHeldPhysicalProductsIDs,
                },
              },
              where: { id: prismaReservation.customer.bag.id },
            })

            // Email the user
            sendYouCanNowReserveAgainEmail(prismaUser)

            // Update the returnPackage on the shipment
            // Check each item on the airtable reservation record. If it's reservable,
            // add it the products on the returnPackage. Then calculate the full
            // weight of the package and add that to the returnPackage as well.
          }
        } else {
          reservationsInAirtableButNotPrisma.push(airtableReservation.fields.ID)
          Sentry.captureMessage(
            `completeReservations encountered a reservation in airtable but not prisma` +
              `: ${JSON.stringify(airtableReservation)} `
          )
        }
      }
    } catch (err) {
      console.log(err)
      errors.push(err)
      Sentry.captureException(err)
    }
  }

  return {
    updatedReservations,
    errors,
    reservationsInAirtableButNotPrisma,
  }
}

function sendYouCanNowReserveAgainEmail(user: User) {
  sendTransactionalEmail(user.email, "TK", {
    name: user.firstName,
  })
}

async function getPrismaReservationWithNeededFields(reservationNumber) {
  return await db.query.reservation(
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
        }
        customer {
            bag {
                id
            }
        }
    }`
  )
}
