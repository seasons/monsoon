import "module-alias/register"

import { TrunkInstance } from "twilio/lib/rest/trunking/v1/trunk"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const allVariantsWithPhysicalProducts = await ps.client.productVariant.findMany(
    {
      where: { total: { gt: 0 } },
      select: {
        id: true,
        total: true,
        reservable: true,
        reserved: true,
        nonReservable: true,
        offloaded: true,
        stored: true,
        physicalProducts: {
          select: {
            inventoryStatus: true,
          },
        },
      },
    }
  )
  let variantsFixed = 0
  let variantsNotNeedingFixing = 0
  for (const variant of allVariantsWithPhysicalProducts) {
    const physicalProducts = variant.physicalProducts
    const trueTotalCount = physicalProducts.length
    const trueReservableCount = physicalProducts.filter(
      a => a.inventoryStatus === "Reservable"
    ).length
    const trueReservedCount = physicalProducts.filter(
      a => a.inventoryStatus === "Reserved"
    ).length
    const trueNonReservableCount = physicalProducts.filter(a => {
      return a.inventoryStatus === "NonReservable"
    }).length
    const trueOffloadedCount = physicalProducts.filter(a => {
      return a.inventoryStatus === "Offloaded"
    }).length
    const trueStoredCount = physicalProducts.filter(a => {
      return a.inventoryStatus === "Stored"
    }).length
    // If any of the counts don't match, update the variant
    if (
      trueTotalCount !== variant.total ||
      trueReservableCount !== variant.reservable ||
      trueNonReservableCount !== variant.nonReservable ||
      trueReservedCount !== variant.reserved ||
      trueOffloadedCount !== variant.offloaded ||
      trueStoredCount !== variant.stored
    ) {
      variantsFixed++
      await ps.client.productVariant.update({
        where: { id: variant.id },
        data: {
          total: trueTotalCount,
          reservable: trueReservableCount,
          reserved: trueReservedCount,
          nonReservable: trueNonReservableCount,
          offloaded: trueOffloadedCount,
          stored: trueStoredCount,
        },
      })
    } else {
      variantsNotNeedingFixing++
    }
  }

  const productVariants = await ps.client.productVariant.findMany({
    select: {
      id: true,
      reservable: true,
      reserved: true,
      nonReservable: true,
      physicalProducts: {
        select: {
          id: true,
          inventoryStatus: true,
        },
      },
    },
  })

  const incorrectCountsProdVariants = productVariants.filter(a => {
    const physicalProducts = a.physicalProducts
    const statusCounts = {
      Reservable: 0,
      NonReservable: 0,
      Reserved: 0,
    }

    for (const physicalProduct of physicalProducts) {
      statusCounts[physicalProduct.inventoryStatus] += 1
    }
    const reservable = a.reservable
    const nonReservable = a.nonReservable
    const reserved = a.reserved

    if (
      statusCounts.Reservable !== reservable ||
      statusCounts.NonReservable !== nonReservable ||
      statusCounts.Reserved !== reserved
    ) {
      return a
    }
  })
  console.log(incorrectCountsProdVariants.length)
  console.dir(incorrectCountsProdVariants, { depth: null })
}
run()
