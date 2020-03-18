import { db } from "../../src/server"

const run = async () => {
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
      console.log(`num: ${customerBagItems.length}`)
      if (customerBagItems.length >= 2) {
        console.log(
          `FOUND IT!!!: customer: ${resy.customer.id}. product variant: ${
            reservedPhysProd.productVariant.id
          }. Statuses: ${customerBagItems.map(
            b => b.status
          )}. Saved: ${customerBagItems.map(b => b.saved)}`
        )
      }
    }
  }
}

run()
