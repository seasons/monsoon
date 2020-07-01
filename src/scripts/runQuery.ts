import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.updateReservation({
    where: { reservationNumber: 213563997 },
    data: {
      products: {
        connect: [
          { seasonsUID: "STIS-BLU-MM-007-01" },
          { seasonsUID: "NIKE-BLU-MM-001-01" },
          { seasonsUID: "PRDA-BLK-MM-006-01" },
        ],
      },
    },
  })
}

run()
