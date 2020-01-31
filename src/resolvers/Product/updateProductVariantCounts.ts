import { Context } from "../../utils"
import { ID_Input, Product as PrismaProduct } from "../../prisma"
import {
  getPhysicalProductsWithReservationSpecificData,
  PhysicalProductWithReservationSpecificData,
  extractUniqueReservablePhysicalProducts,
} from "./utils"
import { ApolloError } from "apollo-server"
import { getAllProductVariants } from "../../airtable/utils"

/* Returns back [ProductsBeingReserved, PhysicalProductsBeingReserved, RollbackFunc] */
export const updateProductVariantCounts = async (
  /* array of product variant ids */
  items: Array<ID_Input>,

  ctx: Context,
  { dryRun } = { dryRun: false }
): Promise<
  [PrismaProduct[], PhysicalProductWithReservationSpecificData[], Function]
> => {
  const prismaProductVariants = await ctx.prisma.productVariants({
    where: { id_in: items },
  })

  const physicalProducts = await getPhysicalProductsWithReservationSpecificData(
    ctx,
    items
  )

  // Are there any unavailable variants? If so, throw an error
  const unavailableVariants = prismaProductVariants.filter(
    v => v.reservable <= 0
  )
  if (unavailableVariants.length > 0) {
    // Remove items in the bag that are not available anymore
    await ctx.prisma.deleteManyBagItems({
      productVariant: {
        id_in: unavailableVariants.map(a => a.id),
      },
      saved: false,
      status: "Added",
    })

    throw new ApolloError(
      "The following item is not reservable",
      "511",
      unavailableVariants
    )
  }

  // Double check that the product variants have a sufficient number of available
  // physical products
  let availablePhysicalProducts = extractUniqueReservablePhysicalProducts(
    physicalProducts
  )
  if (availablePhysicalProducts.length < items.length) {
    // TODO: list out unavailable items
    throw new ApolloError(
      "One or more product variants does not have an available physical product",
      "515"
    )
  }

  // Get the corresponding product variant records from airtable
  const allAirtableProductVariants = await getAllProductVariants()
  const allAirtableProductVariantSlugs = prismaProductVariants.map(a => a.sku)
  const airtableProductVariants = allAirtableProductVariants.filter(a =>
    allAirtableProductVariantSlugs.includes(a.model.sKU)
  )

  const productsBeingReserved = [] as PrismaProduct[]
  const rollbackFuncs = []
  try {
    for (let prismaProductVariant of prismaProductVariants) {
      const iProduct = await ctx.prisma
        .productVariant({ id: prismaProductVariant.id })
        .product()
      productsBeingReserved.push(iProduct)

      // Update product variant counts in prisma and airtable
      if (!dryRun) {
        const data = {
          reservable: prismaProductVariant.reservable - 1,
          reserved: prismaProductVariant.reserved + 1,
        }
        const rollbackData = {
          reservable: prismaProductVariant.reservable,
          reserved: prismaProductVariant.reserved,
        }

        await ctx.prisma.updateProductVariant({
          where: {
            id: prismaProductVariant.id,
          },
          data,
        })
        const rollbackPrismaProductVariantUpdate = async () => {
          await ctx.prisma.updateProductVariant({
            where: {
              id: prismaProductVariant.id,
            },
            data: rollbackData,
          })
        }
        rollbackFuncs.push(rollbackPrismaProductVariantUpdate)

        // Airtable record of product variant
        const airtableProductVariant = airtableProductVariants.find(
          a => a.model.sKU === prismaProductVariant.sku
        )
        if (airtableProductVariant) {
          await airtableProductVariant.patchUpdate({
            "Reservable Count": data.reservable,
            "Reserved Count": data.reserved,
          })
          const rollbackAirtableProductVariantUpdate = async () => {
            await airtableProductVariant.patchUpdate({
              "Reservable Count": rollbackData.reservable,
              "Reserved Count": rollbackData.reserved,
            })
          }
          rollbackFuncs.push(rollbackAirtableProductVariantUpdate)
        }
      }
    }
  } catch (err) {
    for (let rollbackFunc of rollbackFuncs) {
      await rollbackFunc()
    }
    throw err
  }

  const rollbackProductVariantCounts = async () => {
    for (let rollbackFunc of rollbackFuncs) {
      await rollbackFunc()
    }
  }

  return [
    productsBeingReserved,
    availablePhysicalProducts,
    rollbackProductVariantCounts,
  ]
}
