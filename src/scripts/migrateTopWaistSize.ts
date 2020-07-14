import "module-alias/register"

import { CustomerDetailUpdateInput } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  for (const customerDetail of await ps.client.customerDetails()) {
    const averageTopSize = customerDetail.averageTopSize?.trim()
    const averageWaistSize = parseInt(customerDetail.averageTopSize?.trim(), 10)

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
