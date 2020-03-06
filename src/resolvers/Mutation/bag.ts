import { Context } from "../../utils"
import { getCustomerFromContext } from "../../auth/utils"
import { head } from "lodash"
import { ApolloError } from "apollo-server"
import { BagItem } from "../../prisma"

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
      status: "Added",
    })
  },

  async removeFromBag(obj, { item, saved }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    const bagItems = await ctx.prisma.bagItems({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id: item,
        },
        saved,
      },
    })
    const bagItem = head(bagItems)

    if (!bagItem) {
      throw new ApolloError("Item can not be found", "514")
    }

    return await ctx.prisma.deleteBagItem({
      id: bagItem.id,
    })
  },

  async saveProduct(obj, { item, save = false }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)
    const bagItems = await ctx.db.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          productVariant: {
            id: item,
          },
          saved: true,
        },
      },
      info
    )
    let bagItem: BagItem = head(bagItems)

    if (save && !bagItem) {
      bagItem = await ctx.prisma.createBagItem({
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
        status: "Added",
      })
    } else {
      if (bagItem) {
        await ctx.prisma.deleteBagItem({
          id: bagItem.id,
        })
      }
    }

    if (save) {
      return ctx.db.query.bagItem(
        {
          where: {
            id: bagItem.id,
          },
        },
        info
      )
    }

    return bagItem
  },
}
