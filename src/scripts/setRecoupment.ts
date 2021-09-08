import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.product.updateMany({
    where: { recoupment: 4 },
    data: {
      recoupment: null,
    },
  })
}
run()
