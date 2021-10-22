import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const newReservationPhysicalProduct = await ps.client.reservationPhysicalProduct.create(
    {
      data: {
        isNew: true,
        // physicalProduct: {
        //   connect:{
        //     id: 'ck2zee3vr0ynl0734waawy9yw'
        //   },
        // },
        physicalProductId: "ck2zee3vr0ynl0734waawy9yw",
      },
      select: {
        id: true,
      },
    }
  )
  console.dir(newReservationPhysicalProduct, { depth: null })
}
run()
