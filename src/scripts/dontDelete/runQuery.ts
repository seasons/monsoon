import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.reservationPhysicalProduct.deleteMany({
    where: { physicalProduct: { seasonsUID: "CRGR-BLK-SS-002-02" } },
  })
  console.log("done")
}
run()
