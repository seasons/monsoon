import { getAllReservations } from "../airtable/utils"
import {
  prisma,
  ID_Input,
  User,
  ReservationStatus,
  Prisma,
  InventoryStatus,
} from "../prisma"
import { calcShipmentWeightFromProductVariantIDs } from "../utils"
import { sendTransactionalEmail } from "../sendTransactionalEmail"
import { db } from "../server"
import * as Sentry from "@sentry/node"
import { SyncError } from "../errors"
import { emails } from "../emails"

const shouldReportErrorsToSentry = process.env.NODE_ENV === "production"

// Set up Sentry, for error reporting
if (shouldReportErrorsToSentry) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
}

export async function syncReservationStatus() {
  const updatedReservations = []
  const errors = []
  const reservationsInAirtableButNotPrisma = []
  const allAirtableReservations = await getAllReservations()

  for (const airtableReservation of allAirtableReservations) {
    try {
      if (shouldReportErrorsToSentry) {
        Sentry.configureScope(scope => {
          scope.setExtra("reservationNumber", airtableReservation.fields.ID)
        })
      }

      const prismaReservation = await getPrismaReservationWithNeededFields(
        airtableReservation.fields.ID
      )

      if (!prismaReservation) {
        reservationsInAirtableButNotPrisma.push(airtableReservation.fields.ID)
        if (shouldReportErrorsToSentry) {
          Sentry.captureException(
            new SyncError("Reservation in airtable but not prisma")
          )
        }
        continue
      }

      // If the reservation has status of "Completed", handle it seperately.
      if (airtableReservation.fields.Status === "Completed") {
        if (prismaReservation.status !== "Completed") {
          // Handle housekeeping
          updatedReservations.push(prismaReservation.reservationNumber)
          const prismaUser = await prisma.user({
            email: airtableReservation.fields["User Email"][0],
          })
          const returnedPhysicalProducts = prismaReservation.products.filter(
            p =>
              [
                "Reservable" as InventoryStatus,
                "NonReservable" as InventoryStatus,
              ].includes(p.inventoryStatus)
          )

          // Update the status
          await prisma.updateReservation({
            data: { status: "Completed" },
            where: { id: prismaReservation.id },
          })

          // Email the user
          sendYouCanNowReserveAgainEmail(prismaUser)

          //   Update the user's bag
          await updateUsersBagItemsOnCompletedReservation(
            prisma,
            prismaReservation,
            returnedPhysicalProducts
          )

          // Update the returnPackage on the shipment
          await updateReturnPackageOnCompletedReservation(
            prisma,
            prismaReservation,
            returnedPhysicalProducts
          )

          // Email an admin a confirmation email
          sendTransactionalEmail({
            to: process.env.OPERATIONS_ADMIN_EMAIL,
            data: emails.reservationReturnConfirmationData(
              prismaReservation.reservationNumber,
              returnedPhysicalProducts.map(p => p.seasonsUID),
              prismaUser.email
            ),
          })
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
      console.log(airtableReservation)
      console.log(err)
      errors.push(err)
      if (shouldReportErrorsToSentry) {
        Sentry.captureException(err)
      }
    }
  }

  return {
    updatedReservations,
    errors,
    reservationsInAirtableButNotPrisma,
  }
}

// *****************************************************************************

function sendYouCanNowReserveAgainEmail(user: User) {
  sendTransactionalEmail({
    to: user.email,
    data: emails.freeToReserveData(),
  })
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
            seasonsUID
            productVariant {
                id
            }
        }
        customer {
            id
            detail {
                shippingAddress {
                    slug
                }
            }
        }
        returnedPackage {
            id
        }
    }`
  )
  return res
}

function airtableToPrismaReservationStatus(
  airtableStatus: string
): ReservationStatus {
  return airtableStatus.replace(" ", "") as ReservationStatus
}

async function updateUsersBagItemsOnCompletedReservation(
  prisma: Prisma,
  prismaReservation: any, // actually a Prisma Reservation with fields specified in getPrismaReservationWithNeededFields
  returnedPhysicalProducts: any[] // fields specified in getPrismaReservationWithNeededFields
) {
  return await prisma.deleteManyBagItems({
    customer: { id: prismaReservation.customer.id },
    saved: false,
    productVariant: {
      id_in: returnedPhysicalProducts.map(p => p.productVariant.id),
    },
  })
}

async function updateReturnPackageOnCompletedReservation(
  prisma: Prisma,
  prismaReservation: any, // actually a Prisma Reservation with fields specified in getPrismaReservationWithNeededFields
  returnedPhysicalProducts: any[] // fields specified in getPrismaReservationWithNeededFields
) {
  const returnedPhysicalProductIDs: {
    id: ID_Input
  }[] = returnedPhysicalProducts.map(p => {
    return { id: p.id }
  })
  const returnedProductVariantIDs: string[] = prismaReservation.products
    .filter(p => p.inventoryStatus === "Reservable")
    .map(prod => prod.productVariant.id)
  const weight = await calcShipmentWeightFromProductVariantIDs(
    prisma,
    returnedProductVariantIDs
  )

  if (prismaReservation.returnedPackage != null) {
    await prisma.updatePackage({
      data: {
        items: { connect: returnedPhysicalProductIDs },
        weight,
      },
      where: { id: prismaReservation.returnedPackage.id },
    })
  } else {
    await prisma.updateReservation({
      data: {
        returnedPackage: {
          create: {
            items: { connect: returnedPhysicalProductIDs },
            weight,
            shippingLabel: {
              create: {},
            },
            fromAddress: {
              connect: {
                slug: prismaReservation.customer.detail.shippingAddress.slug,
              },
            },
            toAddress: {
              connect: {
                slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
              },
            },
          },
        },
      },
      where: {
        id: prismaReservation.id,
      },
    })
  }
}
