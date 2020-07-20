import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const physProdsToClear = [
    "CRGR-BLK-LL-002-02",
    "ACNE-BLK-LL-008-01",
    "RHUD-BLK-MM-001-01",
    "KAYE-BLK-MM-003-01",
    "ACNE-GRN-SS-013-01",
    "STIS-GRN-MM-012-01",
    "HPIM-BLK-MM-003-01",
    "CSBA-WTE-MM-007-02",
  ]
  for (const seasonsUID of physProdsToClear) {
    try {
      await ps.client.updatePhysicalProduct({
        where: { seasonsUID },
        data: { warehouseLocation: { disconnect: true } },
      })
      console.log(`'cleared WLID off ${seasonsUID}`)
    } catch (err) {
      console.log(err)
    }
  }
}

run()
