import {
  getAllReservations,
  getAllPhysicalProducts,
} from "../../src/airtable/utils"
import {
  prisma,
  ReservationStatus,
  ReservationWhereUniqueInput,
} from "../../src/prisma"

const reservationsToBackfillAirtableToPrisma = []
const reservationNumbersForReservationsToSyncStatusFromAirtableToPrisma = []

async function airtableToPrisma() {
  const allAirtableReservations = await getAllReservations()
  const allAirtablePhysicalProducts = await getAllPhysicalProducts()

  // Iterate through the array of reservations to sync from airtable to prisma.
  let createdRecords = []
  for (let resNumber of reservationsToBackfillAirtableToPrisma) {
    // Get the reservation record from airtable
    const airtableResy = allAirtableReservations.find(
      resy => resy.fields.ID === resNumber
    )
    if (!airtableResy) {
      throw new Error(
        `No reservation with ID ${resNumber} found on airtable. Exiting script.`
      )
    }

    // Make sure there is no such record on prisma
    const prismaResy = await prisma.reservation({
      reservationNumber: resNumber,
    })
    if (!!prismaResy) {
      throw new Error(
        `Reservation with ID ${resNumber} already exists in prisma. Exiting script`
      )
    }

    // Create the record in prisma
    console.log(`**** CREATING RECORD ${resNumber} IN PRISMA *****`)
    let userEmail
    try {
      userEmail = airtableResy.fields["User Email"][0]
    } catch (err) {
      console.log(
        `ERROR ACCESING USER EMAIL ON RESERVATION. EMAIL FIELD IN AIRTABLE RESY: ${airtableResy.fields["User Email"]}`
      )
      throw err
    }

    let prismaCustomer
    try {
      const _prismaCustomer = await prisma.customers({
        where: { user: { email: userEmail } },
      })
      prismaCustomer = _prismaCustomer[0]
    } catch (err) {
      console.log(`COULD NOT FIND CUSTOMER WITH USER WITH EMAIL: ${userEmail}`)
      throw err
    }

    await prisma.createReservation({
      user: {
        connect: {
          email: userEmail,
        },
      },
      customer: {
        connect: { id: prismaCustomer.id },
      },
      products: {
        connect: getPhysicalProductConnectData(
          airtableResy,
          allAirtablePhysicalProducts
        ),
      },
      reservationNumber: resNumber,
      shipped: false,
      status: "Completed" as ReservationStatus,
    })
    console.log(`**** CREATED RECORD ${resNumber} IN PRISMA ******`)
    createdRecords.push(resNumber)
  }

  console.log(`**** CREATED RECORDS ${createdRecords} IN PRISMA ****`)
}
async function syncAirtableStatusesToPrismaStatuses() {
  const allAirtableReservations = await getAllReservations()

  for (let resNumber of reservationNumbersForReservationsToSyncStatusFromAirtableToPrisma) {
    // Get the reservation record from airtable
    const airtableResy = allAirtableReservations.find(
      resy => resy.fields.ID === resNumber
    )
    if (!airtableResy) {
      throw new Error(
        `No reservation with ID ${resNumber} found on airtable. Exiting script.`
      )
    }

    // Update the record in prisma
    const updatedResy = await prisma.updateReservation({
      data: { status: airtableResy.fields.Status },
      where: { reservationNumber: resNumber },
    })
    console.log(airtableResy.fields.Status)
    console.log(updatedResy)
  }
}

syncAirtableStatusesToPrismaStatuses()

/*******************************************************************************/
function getPhysicalProductConnectData(
  airtableResy,
  allAirtablePhysicalProducts
): { seasonsUID: string }[] {
  const airtablePhysicalProductRecordIDs = airtableResy.fields["Items"]
  return allAirtablePhysicalProducts
    .filter(prod => airtablePhysicalProductRecordIDs.includes(prod.id))
    .map(prod => {
      return { seasonsUID: prod.fields.SUID.text }
    })
}
