import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const physicalProductSUID = "RHUD-RED-MM-025-02"
  const email = "brian.a.watson@gmail.com"

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

  const activeRentalInvoice = await ps.client.rentalInvoice.findFirst({
    where: { membership: { customer: { user: { email } } }, status: "Draft" },
    orderBy: { createdAt: "desc" },
    select: { id: true, products: { select: { seasonsUID: true } } },
  })
  const productsOnInvoice = activeRentalInvoice.products
    .map(a => a.seasonsUID)
    .includes(physicalProductSUID)
  if (!productsOnInvoice) {
    await ps.client.rentalInvoice.update({
      where: { id: activeRentalInvoice.id },
      data: {
        products: {
          connect: {
            seasonsUID: physicalProductSUID,
          },
        },
      },
    })
    console.log("Added product to rental invoice")
  } else {
    console.log("product already on invoice. did not add it")
  }
}

run()
