import { Context } from "../../utils"
import { getCustomerFromContext } from "../../auth/utils"
import { RecentlyViewedProduct } from "../../prisma"
import { head } from "lodash"

export const recentlyViewedProduct = {
  async addViewedProduct(_obj, { item }, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)
    const viewedProducts = await ctx.db.query.recentlyViewedProducts(
      {
        where: {
          customer: { id: customer.id },
          product: { id: item },
        },
      },
      info
    )

    const viewedProduct: RecentlyViewedProduct = head(viewedProducts)

    if (viewedProduct) {
      return await ctx.prisma.updateRecentlyViewedProduct({
        where: {
          id: viewedProduct.id,
        },
        data: {
          viewCount: viewedProduct.viewCount++,
        },
      })
    } else {
      return await ctx.prisma.createRecentlyViewedProduct({
        customer: {
          connect: {
            id: customer.id,
          },
        },
        product: {
          connect: {
            id: item,
          },
        },
        viewCount: 1,
      })
    }
  },
}
