import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.updatePhysicalProduct({
    where: { id: "ck8apmujc6d7p0792t3xetqlj" },
    data: { warehouseLocation: { disconnect: true } },
  })
}

run()
