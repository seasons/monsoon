import "module-alias/register"

import { TimeUtilsService } from "../../modules/Utils/services/time.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const email = "jyoung27@buffalo.edu"
  const c = await ps.client.bagItem.findMany({
    where: { customer: { user: { email } } },
    select: {
      status: true,
      reservationPhysicalProduct: {
        select: {
          status: true,
          scannedOnInboundAt: true,
          physicalProduct: { select: { seasonsUID: true } },
        },
      },
    },
  })
  console.dir(c, { depth: null })
}
run()
