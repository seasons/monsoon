import { Context } from "../utils"
import { Homepage } from "./Homepage"
import { getUserId } from "../auth/utils"

export const Query = {
  async me(parent, args, ctx: Context) {
    const { id } = await getUserId(ctx)
    return ctx.prisma.user({ id })
  },

  products: async (parent, args, ctx: Context, info) => {
    if (args.category && args.category !== "all") {
      const category = await ctx.prisma.category({ slug: args.category })
      const children = await ctx.prisma
        .category({ slug: args.category })
        .children()

      const filter =
        children.length > 0
          ? {
              where: {
                OR: children.map(({ slug }) => ({ category: { slug } })),
              },
            }
          : {
              where: {
                category: { slug: category.slug },
              },
            }
      const { first, skip } = args
      const products = await ctx.db.query.products(
        { first, skip, ...filter },
        info
      )
      return products
    }

    const result = await ctx.db.query.products(args, info)
    return result
  },

  product: (parent, args, ctx: Context, info) =>
    ctx.db.query.product(args, info),

  collections: (parent, args, ctx: Context, info) =>
    ctx.db.query.collections(args, info),

  collection: (parent, args, ctx: Context, info) =>
    ctx.db.query.collection(args, info),

  productFunctions: (parent, args, ctx: Context, info) =>
    ctx.db.query.productFunctions(args, info),

  categories: (parent, args, ctx: Context, info) =>
    ctx.db.query.categories(args, info),

  homepage: Homepage,
}
