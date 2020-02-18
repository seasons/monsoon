import { getUserFromContext } from "../auth/utils"
import { Context } from "../utils"

export const ProductVariantWant = {
  async productVariantWantExists(parent, { variantID }, ctx: Context, info) {
    const user = await getUserFromContext(ctx)
    if (!user) {
      throw new Error("Missing user from context")
    }

    console.log("FINDING")
    const productVariant = await ctx.prisma.productVariant({ id: variantID })
    if (!productVariant) {
      throw new Error("Failed to find product variant for id")
    }
    console.log("HERE")

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
    return { exists }
  }
}

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