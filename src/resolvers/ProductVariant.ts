import { Context } from "../utils"
import { getCustomerFromContext } from "../auth/utils"

export const ProductVariant = {
  async isSaved(parent, {}, ctx: Context, info) {
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
}
