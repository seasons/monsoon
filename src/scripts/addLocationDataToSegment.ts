import "module-alias/register"

import { SegmentService } from "../modules/Analytics/services/segment.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const segment = new SegmentService()
  console.log(`before all customers retrieved`)
  const allCustomers = await ps.binding.query.customers(
    {},
    `{id user {id} detail {shippingAddress {city state zipCode}}}`
  )
  console.log(`all customers retrieved`)
  let i = 0
  const total = allCustomers.length
  for (const cust of allCustomers) {
    //   if (i++ > 1) {
    //       break
    //   }
    console.log(`${i++} of ${total}`)
    await segment.identify(cust.user.id, {
      address: {
        city: cust?.detail?.shippingAddress?.city,
        postalCode: cust?.detail?.shippingAddress?.zipCode,
        state: cust?.detail?.shippingAddress?.state,
      },
      state: cust?.detail?.shippingAddress?.state,
    })
  }
}

run()
