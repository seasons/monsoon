import { Context } from "../../utils"
import { getCustomerFromContext, getUserFromContext } from "../../auth/utils"

export const bag = {
  async addToBag(obj, { item }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    // Check if the user still can add more items to bag
    // If not throw error

    return await ctx.prisma.createBagItem({
      customer: {
        connect: {
          id: customer.id,
        },
      },
      productVariant: {
        connect: {
          id: item,
        },
      },
      position: 0,
      saved: false,
    })
  },

  async saveProduct(obj, { item }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    // Check if the user still can add more items to bag
    // If not throw error
    await ctx.prisma.createBagItem({
      customer: {
        connect: {
          id: customer.id,
        },
      },
      productVariant: {
        connect: {
          id: item,
        },
      },
      position: 0,
      saved: false,
    })
  },
}
