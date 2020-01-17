import { prisma } from "../../src/prisma"
import { db } from "../../src/server"

async function backfillBags() {
  try {
    const activeReservations = await db.query.reservations(
      {
        where: {
          status_not: "Completed",
        },
      },
      `
   {
       id
       customer {
           id
       }
       products {
          id
            productVariant {
                id
            }
        }
       status
   }
  `
    )

    for (let reservation of activeReservations) {
      const customer = reservation.customer

      for (let physicalProduct of reservation.products) {
        const productVariant = physicalProduct.productVariant
        const bagItemStatus =
          reservation.status === "Received" ? "Received" : "Reserved"
        const bagItem = await prisma.createBagItem({
          productVariant: {
            connect: {
              id: productVariant.id,
            },
          },
          customer: {
            connect: {
              id: customer.id,
            },
          },
          position: 0,
          saved: false,
          status: bagItemStatus,
        })

        console.log(bagItem)
      }
    }
  } catch (e) {
    console.error(e)
  }
}

backfillBags()
