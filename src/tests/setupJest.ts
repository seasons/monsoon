import path from "path"

import { PrismaService } from "@app/prisma/prisma.service"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

jest.setTimeout(50000)

// Fix variant counts so that doesn't cause test failures
const fixVariantCounts = async () => {
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
}
fixVariantCounts()
