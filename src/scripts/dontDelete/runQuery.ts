import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.product.updateMany({
    where: { rentalPriceOverride: { gt: 0 } },
    data: { rentalPriceOverride: null },
  })
}
run()
