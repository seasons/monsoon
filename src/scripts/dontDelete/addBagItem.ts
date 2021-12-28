import "module-alias/register"

import { head } from "lodash"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const physicalProductSUID = "CSBA-WTE-SS-033-01"
  const email = "rishi0928+1@gmail.com"
  const rppStatus = "Packed"
  const bagItemStatus = "Reserved"

  const prodVar = await ps.client.productVariant.findFirst({
    where: { physicalProducts: { some: { seasonsUID: physicalProductSUID } } },
  })
  const customer = await ps.client.customer.findFirst({
    where: { user: { email } },
  })

  const bagItem = await ps.client.bagItem.create({
    data: {
      saved: false,
      productVariant: { connect: { id: prodVar.id } },
      physicalProduct: { connect: { seasonsUID: physicalProductSUID } },
      status: bagItemStatus,
      customer: {
        connect: { id: customer.id },
      },
    },
  })

  const reservations = await ps.client.reservation.findMany({
    where: {
      customer: {
        id: customer.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
    },
  })
  const reservation = head(reservations)

  await ps.client.reservationPhysicalProduct.create({
    data: {
      status: rppStatus,
      physicalProduct: {
        connect: { seasonsUID: physicalProductSUID },
      },
      customer: {
        connect: {
          id: customer.id,
        },
      },
      bagItem: {
        connect: {
          id: bagItem.id,
        },
      },
      reservation: {
        connect: {
          id: reservation.id,
        },
      },
    },
  })

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
