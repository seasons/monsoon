import { Prisma, ID_Input } from "../../prisma"

export async function markBagItemsReserved(
  prisma: Prisma,
  customer_id: ID_Input,
  productVariantIds: Array<ID_Input>
): Promise<Function> {
  // Update the bag items
  const bagItemsToUpdate = await prisma.bagItems({
    where: {
      customer: {
        id: customer_id,
      },
      productVariant: {
        id_in: productVariantIds,
      },
      status: "Added",
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
