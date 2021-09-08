import "module-alias/register"

import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const utils = new UtilsService(ps)

  /*
    Query all products
    Filter by ones where at least one unit cost on a downstream physical product is equal to the product retail price
    For such items, calculate the monthly rental price. Then set the rental price override to 1/2 that value. 

  */
  const allProducts = await ps.client.product.findMany({
    where: { retailPrice: { gt: 0 }, variants: { some: { total: { gt: 0 } } } },
    select: {
      id: true,
      retailPrice: true,
      recoupment: true,
      wholesalePrice: true,
      rentalPriceOverride: true,
      category: { select: { dryCleaningFee: true } },
      name: true,
      variants: {
        select: { physicalProducts: { select: { unitCost: true } } },
      },
      season: {
        select: {
          internalSeason: { select: { seasonCode: true, year: true } },
        },
      },
    },
  })

  const productsPurchasedAtRetail = allProducts.filter(a => {
    const units = a.variants.flatMap(b => b.physicalProducts)
    const maxUnitCost = Math.max(...units.map(a => a.unitCost))
    return maxUnitCost === a.retailPrice
  })

  for (const prod of productsPurchasedAtRetail) {
    const unadjustedMonthlyRentalPrice = utils.calcRentalPrice(prod, {
      type: "monthly",
      ignoreOverride: true,
    })

    const season = !!prod.season
      ? `${prod.season?.internalSeason?.seasonCode}${prod.season?.internalSeason?.year}`
      : ""
    const adjsutedPriceRaw = unadjustedMonthlyRentalPrice / 2
    const roundToNearestMultipleOfFive = price => Math.ceil(price / 5) * 5
    console.log(
      `${season} -- ${
        prod.name
      }. Would be: ${unadjustedMonthlyRentalPrice}. Discounted: ${
        unadjustedMonthlyRentalPrice / 2
      }`
    )

    const adjustedPriceRounded = roundToNearestMultipleOfFive(adjsutedPriceRaw)
    await ps.client.product.update({
      where: { id: prod.id },
      data: { rentalPriceOverride: adjustedPriceRounded },
    })
  }
}
run()
