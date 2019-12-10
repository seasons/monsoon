import { Context } from "../utils"
import { getCustomerFromContext } from "../auth/utils"

export const ProductVariant = {
  async isSaved(parent, {}, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    const bagItem = await ctx.prisma.bagItems({
      where: {},
    })

    return true

    // const product = await ctx.prisma
    //   .customer({
    //     id: customer.id,
    //   })
    //   .savedProducts({
    //     where: {
    //       id: parent.id,
    //     },
    //   })

    // return !!product.length
  },
}
