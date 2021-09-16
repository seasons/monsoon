import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const bagItemID = "cks1w6bs04312182drbtq6yibbb"

  /*
    Mark physical product as NonReservable
    Update Product Variant Counts
    Delete bag item
    TODO: Add physical product to returnedProducts array on reservation
  */

  const bagItemWithData = await ps.client.bagItem.findUnique({
    where: { id: bagItemID },
    select: {
      status: true,
      physicalProduct: { select: { id: true } },
      productVariant: {
        select: { id: true, reserved: true, nonReservable: true },
      },
    },
  })
  if (bagItemWithData.status !== "Reserved") {
    throw "This script is only for deleting reserved bag items"
  }
  const promises = []
  promises.push(
    ps.client.physicalProduct.update({
      where: { id: bagItemWithData.physicalProduct.id },
      data: { inventoryStatus: "NonReservable" },
    })
  )
  promises.push(
    ps.client.productVariant.update({
      where: { id: bagItemWithData.productVariant.id },
      data: {
        reserved: bagItemWithData.productVariant.reserved - 1,
        nonReservable: bagItemWithData.productVariant.nonReservable + 1,
      },
    })
  )
  promises.push(ps.client.bagItem.delete({ where: { id: bagItemID } }))
  await ps.client.$transaction(promises)

  console.log(
    `bag item deleted. physical product status updated. variant counts updated`
  )
}

run()
