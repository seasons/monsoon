/*
Marks as "reserved" all physical products which are currently part of a reservation
with status "InQueue"

NOTE: THIS IS A ONE-OFF SCRIPT AND SHOULD NOT BE EXECUTED IN THE FUTURE WITHOUT
REVISITING THE LOGIC
*/
import { prisma } from "../src/prisma"

async function syncReservedPhysicalProductStatuses() {
  const allActiveReservations = await prisma.reservations({
    where: { status: "InQueue" },
  })
  for (let resy of allActiveReservations) {
    console.log(`UPDATING PRODUCTS FROM RESY ${resy.id}`)
    const physicalProducts = await prisma
      .reservation({ id: resy.id })
      .products()
    console.log("BEFORE UPDATE")
    console.log(physicalProducts)
    for (let product of physicalProducts) {
      await prisma.updatePhysicalProduct({
        data: { inventoryStatus: "Reserved" },
        where: { id: product.id },
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
