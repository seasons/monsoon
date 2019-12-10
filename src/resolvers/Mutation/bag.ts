import { Context } from "../../utils"
import { getCustomerFromContext, getUserFromContext } from "../../auth/utils"
import { head } from "lodash"

export const bag = {
  async addToBag(obj, { item }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    // Check if the user still can add more items to bag
    // If not throw error

    // Check if the bag item already exists
    // Upsert it instead

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

  async saveProduct(obj, { item, save = false }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    if (save) {
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
        saved: save,
      })
    } else {
      const bagItems = await ctx.prisma.bagItems({
        where: {
          customer: {
            id: customer.id,
          },
          productVariant: {
            id: item,
          },
        },
      })
      const bagItem = head(bagItems)

      if (bagItem) {
        await ctx.prisma.deleteBagItem({
          id: bagItem.id,
        })
      }

      return bagItem
    }
  },
}
