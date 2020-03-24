import { Context } from "../../../utils"
import { addFragmentToInfo } from "graphql-binding"
import { uniqBy, sortedUniqBy, sortedUniq } from "lodash"

export async function variants(parent, {}, ctx: Context, info) {
  const productVariants = await ctx.db.query.productVariants(
    {
      where: {
        product: {
          id: parent.id,
        },
      },
    },
    addFragmentToInfo(
      info,
      `
        fragment EnsureDisplay on ProductVariant {
            internalSize {
                display
                productType
            }
        }
    `
    )
  )

  const type = productVariants?.[0]?.internalSize?.productType

  if (type === "Top") {
    return sortVariants(productVariants)
  }

  try {
    const sortedVariants = productVariants.sort((a, b) => {
      return a?.internalSize?.display - b?.internalSize?.display
    })
    const uniqueVariants = sortedUniqBy(
      sortedVariants,
      (a: any) => a?.internalSize?.display
    )
    return uniqueVariants
  } catch (e) {
    return []
  }
}

const sizes = {
  xs: {
    sortWeight: 0,
  },
  s: {
    sortWeight: 1,
  },
  m: {
    sortWeight: 2,
  },
  l: {
    sortWeight: 3,
  },
  xl: {
    sortWeight: 4,
  },
  xxl: {
    sortWeight: 5,
  },
}

export const sortVariants = variants => {
  const uniqueArray = uniqBy(variants, "internalSize.display")
  return uniqueArray.sort((variantA: any, variantB: any) => {
    const sortWeightA =
      (variantA.internalSize?.display &&
        sizes[variantA.internalSize?.display.toLowerCase()] &&
        sizes[variantA.internalSize?.display.toLowerCase()].sortWeight) ||
      0
    const sortWeightB =
      (variantB.internalSize?.display &&
        sizes[variantB.internalSize?.display.toLowerCase()] &&
        sizes[variantB.internalSize?.display.toLowerCase()].sortWeight) ||
      0
    return sortWeightA - sortWeightB
  })
}
