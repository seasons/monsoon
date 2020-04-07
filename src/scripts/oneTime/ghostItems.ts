import { db } from "../../src/server"
import { prisma } from "../../src/prisma"

const run = async () => {
  let count = 0
  const allNoncompletedReservations = await db.query.reservations(
    { where: { status_not: "Completed" } },
    `
    {
        id
        customer {
            id
        }
        products {
            productVariant {
                id
            }
        }
    }
    `
  )
  for (const resy of allNoncompletedReservations) {
    const allCustomerBagItems = await db.query.bagItems(
      { where: { customer: { id: resy.customer.id } } },
      `
        {
            id
            productVariant {
                id
            }
            status
            saved
        }
      `
    )
    for (const reservedPhysProd of resy.products) {
      const customerBagItems = allCustomerBagItems.filter(
        b => b.productVariant.id === reservedPhysProd.productVariant.id
      )
      if (customerBagItems.length >= 2) {
        count += 1
      }
    }
  }
  console.log(`num bagItems to update: ${count}`)
}

const fixBagItemStatuses = async () => {
  const count = await prisma.updateManyBagItems({
    where: { status: "Reserved", saved: true },
    data: { status: "Added" },
  })
  console.log(`bag Items updated: ${JSON.stringify(count)}`)
}

// run()
// fixBagItemStatuses()
