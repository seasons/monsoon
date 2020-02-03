import { PhysicalProduct, Prisma } from "../../prisma"

export async function markPhysicalProductsReservedOnPrisma(
  prisma: Prisma,
  physicalProducts: Array<PhysicalProduct>
): Promise<Function> {
  const physicalProductIDs = physicalProducts.map(a => a.id)
  await prisma.updateManyPhysicalProducts({
    where: { id_in: physicalProductIDs },
    data: { inventoryStatus: "Reserved" },
  })
  const rollbackMarkPhysicalProductReservedOnPrisma = async () => {
    await prisma.updateManyPhysicalProducts({
      where: { id_in: physicalProductIDs },
      data: { inventoryStatus: "Reservable" },
    })
  }
  return rollbackMarkPhysicalProductReservedOnPrisma
}
