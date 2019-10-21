import { getUserId } from "../auth/utils"
import { Context } from "../utils"
import { ProductWhereInput } from "../prisma"

export const Query = {
  async me(parent, args, ctx: Context) {
    const { id } = await getUserId(ctx)
    return ctx.prisma.user({ id })
  },
  products: async (parent, args, ctx: Context, info) => {
    const result = await ctx.db.query.products(args, info)
    return result
  },

  product: (parent, args, ctx: Context, info) =>
    ctx.db.query.product(args, info),

  productFunctions: (parent, args, ctx: Context, info) =>
    ctx.db.query.productFunctions(args, info),

  categories: (parent, args, ctx: Context, info) =>
    ctx.db.query.categories(args, info),
}
