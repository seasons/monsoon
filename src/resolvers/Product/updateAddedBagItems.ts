import { Prisma, ID_Input } from "../../prisma"

export async function markBagItemsReserved (
  prisma: Prisma,
  customerId: ID_Input,
  productVariantIds: ID_Input[]
): Promise<() => {}> {
  // Update the bag items
  const bagItemsToUpdate = await prisma.bagItems({
    where: {
      customer: {
        id: customerId,
      },
      productVariant: {
        id_in: productVariantIds,
      },
      status: "Added",
      saved: false,
    },
  })
  const bagItemsToUpdateIds = bagItemsToUpdate.map(a => a.id)

  await prisma.updateManyBagItems({
    where: { id_in: bagItemsToUpdateIds },
    data: {
      status: "Reserved",
    },
  })

  // Create and return a rollback function
  const rollbackAddedBagItems = async () => {
    await prisma.updateManyBagItems({
      where: { id_in: bagItemsToUpdateIds },
      data: {
        status: "Added",
      },
    })
  }
  return rollbackAddedBagItems
}
