import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.reservation.create({
    data: {
      reservationPhysicalProducts: {
        create: { physicalProduct: { connect: { seasonsUID: "" } } },
      },
    },
  })
}
run()
