import "module-alias/register"

import { CustomerDetailUpdateInput } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  console.log("Fetching customer details from Prisma...")
  const customerDetails = await ps.client.customerDetails()

  let i = 0
  const total = customerDetails.length

  for (const customerDetail of customerDetails) {
    console.log(`${i++} of ${total}`)

    const averageTopSize = customerDetail.averageTopSize?.trim()
    const averageWaistSize = parseInt(
      customerDetail.averageWaistSize?.trim(),
      10
    )

    const data: CustomerDetailUpdateInput = {}
    if (averageTopSize) {
      data.topSizes = { set: [averageTopSize] }
    }
    if (averageWaistSize) {
      data.waistSizes = { set: [averageWaistSize] }
    }
    await ps.client.updateCustomerDetail({
      where: { id: customerDetail.id },
      data,
    })
  }
}

run()
