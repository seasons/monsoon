import { Context } from "../utils"
import { getCustomerFromContext, getUserFromContext } from "../auth/utils"

export const ProductVariant = {
  async isSaved(parent, { }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    const bagItems = await ctx.prisma.bagItems({
      where: {
        productVariant: {
          id: parent.id,
        },
        customer: {
          id: customer.id,
        },
        saved: true,
      },
    })

    return bagItems.length > 0
  },

  async isWanted(parent, { }, ctx: Context, info) {
    console.log("GETTING ISWANTED")
    const user = await getUserFromContext(ctx)
    if (!user) {
      return false
      // throw new Error("Missing user from context")
    }

    const productVariant = await ctx.prisma.productVariant({ id: parent.id })
    if (!productVariant) {
      return false
      // throw new Error("Failed to find product variant for id")
    }

    const productVariantWants = await ctx.prisma.productVariantWants({
      where: {
        user: {
          id: user.id
        },
        AND: {
          productVariant: {
            id: productVariant.id
          }
        }
      }
    })

    const exists = productVariantWants && productVariantWants.length > 0
    return exists
    // return { exists }
  }
}
