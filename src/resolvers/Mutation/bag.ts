import { Context } from "../../utils"
import { getCustomerFromContext } from "../../auth/utils"
import { head } from "lodash"
import { ApolloError } from "apollo-server"

const BAG_SIZE = 3

export const bag = {
  async addToBag(obj, { item }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    // Check if the user still can add more items to bag
    // If not throw error

    // Check if the bag item already exists
    // Upsert it instead
    const bag = await ctx.prisma.bagItems({
      where: {
        customer: {
          id: customer.id,
        },
        saved: false,
      },
    })

    if (bag.length >= BAG_SIZE) {
      throw new ApolloError("Bag is full", "514")
    }

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

  async removeFromBag(obj, { item }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    const bagItems = await ctx.prisma.bagItems({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id: item,
        },
        saved: false,
      },
    })
    const bagItem = head(bagItems)

    return await ctx.prisma.deleteBagItem({
      id: bagItem.id,
    })
  },

  async saveProduct(obj, { item, save = false }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)
    const bagItems = await ctx.prisma.bagItems({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id: item,
        },
        saved: true,
      },
    })
    const bagItem = head(bagItems)

    if (save && !bagItem) {
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
      if (bagItem) {
        await ctx.prisma.deleteBagItem({
          id: bagItem.id,
        })
      }
    }
    return bagItem
  },
}
