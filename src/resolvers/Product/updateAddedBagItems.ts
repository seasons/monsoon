import { Prisma, ID_Input } from "../../prisma"

// TODO: Suspected bug: this currently updates all bagItems across all customers.
// We need to scope this to a particular customer

export async function markBagItemsReserved(
  prisma: Prisma,
  productVariantIds: Array<ID_Input>
): Promise<Function> {
  // Update the bag items
  const bagItemsToUpdate = await prisma.bagItems({
    where: {
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
