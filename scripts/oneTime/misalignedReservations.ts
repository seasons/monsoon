import { prisma, Reservation } from "../../src/prisma"
import { getAllReservations } from "../../src/airtable/utils"

async function displayReservationsInOnePlaceButNotTheOther() {
  // Get all the reservation records on airtable && prisma.
  const allAirtableReservations = await getAllReservations()
  let allPrismaReservations = await prisma.reservations()

  let reservationsOnAirtableButNotPrisma = []
  // For all the reservation records from airtable, check if there is a corresponding
  // record in prisma. If there is, remove that record from the prisma records array.
  // If there isnt, add it to the tracking list
  for (let airtableReservation of allAirtableReservations) {
    const correspondingPrismaReservation = getPrismaReservation(
      allPrismaReservations,
      airtableReservation.fields.ID
    )
    if (!!correspondingPrismaReservation) {
      allPrismaReservations = allPrismaReservations.filter(
        r =>
          r.reservationNumber !==
          correspondingPrismaReservation.reservationNumber
      )
    } else {
      reservationsOnAirtableButNotPrisma.push(airtableReservation)
    }
  }

  // Report on records that were not on both airtable and prisma
  console.log(`** RECORDS ON AIRTABLE BUT NOT PRISMA **`)
  for (let rec of reservationsOnAirtableButNotPrisma) {
    console.log(rec.fields.ID)
    console.log("\n")
  }
  console.log(`** RECORDS ON PRISMA BUT NOT AIRTABLE **`)
  for (let rec of allPrismaReservations) {
    console.log(rec.reservationNumber)
    console.log("\n")
  }
}

function getPrismaReservation(
  prismaReservations: Reservation[],
  reservationNumber: number
): Reservation | null {
  const correspondingReservationAsLengthOneArray = prismaReservations.filter(
    r => r.reservationNumber === reservationNumber
  )
  return correspondingReservationAsLengthOneArray.length === 1
    ? correspondingReservationAsLengthOneArray[0]
    : null
}

displayReservationsInOnePlaceButNotTheOther()
