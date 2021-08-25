import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.product.updateMany({
    data: {
      recoupment: 4,
    },
  })
}
run()
