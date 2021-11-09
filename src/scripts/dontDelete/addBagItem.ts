import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const physicalProductSUID = "WLSB-RED-SS-015-01"
  const email = "larryrmilstein@gmail.com"

  const prodVar = await ps.client.productVariant.findFirst({
    where: { physicalProducts: { some: { seasonsUID: physicalProductSUID } } },
  })
  const customer = await ps.client.customer.findFirst({
    where: { user: { email } },
  })

  await ps.client.bagItem.create({
    data: {
      saved: false,
      productVariant: { connect: { id: prodVar.id } },
      physicalProduct: { connect: { seasonsUID: physicalProductSUID } },
      status: "Reserved",
      customer: {
        connect: { id: customer.id },
      },
    },
  })
  console.log("bag item added")
}

run()
