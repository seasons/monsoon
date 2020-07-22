import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

type topDisplaySize = "XS" | "S" | "M" | "L" | "XL" | "XXL"

const run = async () => {
  const ps = new PrismaService()
  for (const size of ["XS", "S", "M", "L", "XL", "XXL"] as topDisplaySize[]) {
    console.log(
      `Percentage ${size} units reserved: ${await percentageUnitsReserved(
        size,
        ps
      )}`
    )
    console.log(
      `Percentage ${size} styles reserved: ${await percentageStylesReserved(
        size,
        ps
      )}`
    )
    console.log(
      `Unsreserved ${size} styles: ${await unreservedStyles(size, ps)}`
    )
  }
}

const percentageUnitsReserved = async (
  size: topDisplaySize,
  ps: PrismaService
) => {
  const availablePhysicalProductsInThatSize = await ps.binding.query.physicalProducts(
    {
      where: {
        AND: [
          { productVariant: { internalSize: { productType: "Top" } } },
          { inventoryStatus_not_in: ["Stored", "Offloaded"] },
          { productVariant: { internalSize: { display: size } } },
        ],
      },
    },
    `{ inventoryStatus }`
  )
  const reservedUnits = availablePhysicalProductsInThatSize.filter(
    a => a.inventoryStatus === "Reserved"
  ).length
  return (reservedUnits / availablePhysicalProductsInThatSize.length) * 100
}

const percentageStylesReserved = async (
  size: topDisplaySize,
  ps: PrismaService
) => {
  const availableProductVariantsInThatSize = await ps.binding.query.productVariants(
    {
      where: {
        AND: [
          { internalSize: { productType: "Top" } },
          { internalSize: { display: size } },
        ],
      },
    },
    `{ reserved }`
  )
  const reservedUnits = availableProductVariantsInThatSize.filter(
    a => a.reserved > 0
  ).length
  return (reservedUnits / availableProductVariantsInThatSize.length) * 100
}

const unreservedStyles = async (size: topDisplaySize, ps: PrismaService) => {
  const availableProductVariantsInThatSize = await ps.binding.query.productVariants(
    {
      where: {
        AND: [
          { internalSize: { productType: "Top" } },
          { internalSize: { display: size } },
          { reservable_gte: 1 },
        ],
      },
    },
    `{ total stored offloaded }`
  )
  return availableProductVariantsInThatSize.filter(
    a => a.total !== a.stored + a.offloaded
  ).length
}

run()
