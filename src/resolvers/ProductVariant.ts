import { Context } from "../utils"
import { getCustomerFromContext } from "../auth/utils"

export const ProductVariant = {
  async isSaved(parent, {}, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    console.log(parent)
    const bagItems = await ctx.prisma.bagItems({
      where: {
        productVariant: {
          id: parent.id,
        },
        saved: true,
      },
    })

    return bagItems.length > 0
  },
}
