import { Context } from "../utils"
import { getCustomerFromContext } from "../auth/utils"

export const ProductVariant = {
  async isSaved(parent, {}, ctx: Context, info) {
    try {
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
    } catch (e) {
      // In case no customer is set
    }
    return false
  },
}
