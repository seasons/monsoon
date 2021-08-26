import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const allReservedBagItems = await ps.client.bagItem.findMany({
    where: { status: "Reserved" },
    select: {
      id: true,
      customer: { select: { id: true } },
      productVariant: {
        select: {
          physicalProducts: { select: { seasonsUID: true } },
          sku: true,
        },
      },
    },
  })
  /*
  For each bag item, get the customer's latest reservation

  Check the products on the reservation for a physical product that matches the bag item. 
    If there are multiple, skip and console log
    Otherwise, set it on the bag item
  */
  const total = allReservedBagItems.length
  let i = 0
  for (const bi of allReservedBagItems) {
    console.log(`${i++} of ${total}`)
    const latestResy = await ps.client.reservation.findFirst({
      orderBy: { createdAt: "desc" },
      where: { customer: { id: bi.customer.id } },
      select: {
        products: {
          select: {
            seasonsUID: true,
            productVariant: { select: { sku: true } },
          },
        },
      },
    })
    const matchingPhysicalProducts = latestResy.products.filter(a =>
      bi.productVariant.physicalProducts
        .map(a => a.seasonsUID)
        .includes(a.seasonsUID)
    )
    if (matchingPhysicalProducts.length > 1) {
      console.log(`Ambiguous case`)
      console.log(bi)
    } else if (matchingPhysicalProducts.length === 0) {
      console.log("No matches found")
      console.log(bi)
    } else {
      const physProd = matchingPhysicalProducts[0]
      if (!physProd.seasonsUID.startsWith(bi.productVariant.sku)) {
        throw new Error(
          `mismatch: ${physProd.seasonsUID}, ${bi.productVariant.sku}`
        )
      }
      await ps.client.bagItem.update({
        where: { id: bi.id },
        data: {
          physicalProduct: {
            connect: { seasonsUID: matchingPhysicalProducts[0].seasonsUID },
          },
        },
      })
    }
  }
}
run()
