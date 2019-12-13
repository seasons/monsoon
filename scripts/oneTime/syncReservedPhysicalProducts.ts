/*
Marks as "reserved" all physical products which are currently part of a reservation
with status "InQueue". Do this on both airtable and prisma. 

NOTE: THIS IS A ONE-OFF SCRIPT AND SHOULD NOT BE EXECUTED IN THE FUTURE WITHOUT
REVISITING THE LOGIC
*/

/*
TODO:
- Update this to also update status of physicalProduct on airtable 
- Update this to more carefully assess which reservations are active or not
*/

import { prisma } from "../../src/prisma"
import { base } from "../../src/airtable/config"
import { getAllPhysicalProducts } from "../../src/airtable/utils"
import { updatePhysicalProduct } from "../../src/airtable/updatePhysicalProduct"
import Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

async function syncReservedPhysicalProductStatuses() {
  const allActiveReservations = await prisma.reservations({
    where: { status: "InQueue" },
  })
  const allAirtablePhysicalProducts = await getAllPhysicalProducts()

  for (let resy of allActiveReservations) {
    console.log(`\nUPDATING PRODUCTS FROM RESY ${resy.id}`)

    const physicalProducts = await prisma
      .reservation({ id: resy.id })
      .products()
    console.log("BEFORE UPDATE")
    console.log(physicalProducts)

    for (let product of physicalProducts) {
      // Update its status in prisma
      await prisma.updatePhysicalProduct({
        data: { inventoryStatus: "Reserved" },
        where: { id: product.id },
      })

      // Update status on airtable
      base("Physical Products").find("recK20SrZ6Ifu2jYs", function(
        err,
        record
      ) {
        if (err) {
          Sentry.captureException(err)
          return
        }
        updatePhysicalProduct(record.id, { "Inventory Status": "Reserved" })
      })
    }

    const physicalProducts2 = await prisma
      .reservation({ id: resy.id })
      .products()
    console.log("AFTER UPDATE")
    console.log(physicalProducts2)
  }
}

syncReservedPhysicalProductStatuses()
