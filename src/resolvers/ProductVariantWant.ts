import { getUserFromContext } from "../auth/utils"
import { Context } from "../utils"

export const ProductVariantWantMutations = {
  async addProductVariantWant(parent, { variantID }, ctx: Context, info) {
    const user = await getUserFromContext(ctx)
    if (!user) {
      throw new Error("Missing user from context")
    }

    const productVariant = await ctx.prisma.productVariant({ id: variantID })
    if (!productVariant) {
      throw new Error("Unable to find product variant with matching ID")
    }

    const productVariantWant = await ctx.prisma.createProductVariantWant({
      productVariant: {
        connect: {
          id: productVariant.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    })
    return productVariantWant
  }
}