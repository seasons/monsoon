/*
Marks as "reserved" all physical products which are currently part of a reservation
with status "InQueue". Do this on both airtable and prisma. 

NOTE: THIS IS A ONE-OFF SCRIPT AND SHOULD NOT BE EXECUTED IN THE FUTURE WITHOUT
REVISITING THE LOGIC
*/

/*
TODO:
- Update this to also update status of physicalProduct on airtable 
*/

import { prisma } from "../../src/prisma"
import { getAllPhysicalProducts } from "../../src/airtable/utils"
import { updatePhysicalProduct } from "../../src/airtable/updatePhysicalProduct"
import { getCorrespondingAirtablePhysicalProduct } from "../utils"

const Sentry = require("@sentry/node")
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

async function syncReservedPhysicalProductStatuses() {
  const allActiveReservations = await prisma.reservations({
    where: { status_not_in: ["Completed", "Cancelled"] },
  })
  const allAirtablePhysicalProducts = await getAllPhysicalProducts()

  for (let resy of allActiveReservations) {
    console.log(`\nUPDATING PRODUCTS FROM RESY ${resy.reservationNumber}`)

    const physicalProducts = await prisma
      .reservation({ id: resy.id })
      .products()

    for (let physProd of physicalProducts) {
      // Update its status in prisma
      await prisma.updatePhysicalProduct({
        data: { inventoryStatus: "Reserved" },
        where: { id: physProd.id },
      })
      console.log(`Update ${physProd.seasonsUID} status --> Reserved in prisma`)

      // Update status on airtable
      const correspondingAirtablePhysicalproduct = getCorrespondingAirtablePhysicalProduct(
        allAirtablePhysicalProducts,
        physProd
      )
      updatePhysicalProduct(correspondingAirtablePhysicalproduct.id, {
        "Inventory Status": "Reserved",
      })
      console.log(
        `Update ${physProd.seasonsUID} status --> Reserved in airtable`
      )
    }
  }
}

syncReservedPhysicalProductStatuses()
