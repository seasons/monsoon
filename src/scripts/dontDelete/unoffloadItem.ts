import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const suidToUnoffload = ""
  const suidThatShoudHaveBeenOffloaded = ""

  const physProdToUnOffload = await ps.client.physicalProduct.findUnique({
    where: { seasonsUID: suidToUnoffload },
  })
  const offloadNotes = physProdToUnOffload.offloadNotes
  await ps.client.physicalProduct.update({
    where: { seasonsUID: suidToUnoffload },
    data: {
      inventoryStatus: "NonReservable",
      offloadMethod: null,
      offloadNotes: "",
    },
  })
  await ps.client.physicalProduct.update({
    where: { seasonsUID: suidThatShoudHaveBeenOffloaded },
    data: {
      inventoryStatus: "Offloaded",
      offloadMethod: "SoldToUser",
      offloadNotes: offloadNotes,
    },
  })
}
run()
