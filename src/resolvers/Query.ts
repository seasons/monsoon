import { Context, getUserIDHash, getCustomerFromUserID } from "../utils"
import { Homepage } from "./Homepage"
import { Faq } from "./Faq"
import { getUserRequestObject, getUserFromContext, getCustomerFromContext } from "../auth/utils"
import chargebee from "chargebee"
import get from "lodash.get"
import { Payment } from "./Payment"
import { Search } from "./Search"
import { Products } from "./Products"

export const Query = {
<<<<<<< HEAD
  ...Products,
=======
  async me(parent, args, ctx: Context) {
    const { id } = await getUserRequestObject(ctx)
    return ctx.prisma.user({ id })
  },

  products: async (parent, args, ctx: Context, info) => {
    const category = args.category || "all"
    const orderBy = args.orderBy || "createdAt_DESC"
    const sizes = args.sizes || []
    // Add filtering by sizes in query
    const where = args.where || {}
    if (sizes && sizes.length > 0) {
      where.variants_some = { size_in: sizes }
    }

    // If client wants to sort by name, we will assume that they
    // want to sort by brand name as well
    if (orderBy.includes("name_")) {
      return await productsAlphabetically(ctx, category, orderBy, sizes)
    }

    if (args.category && args.category !== "all") {
      const category = await ctx.prisma.category({ slug: args.category })
      const children = await ctx.prisma
        .category({ slug: args.category })
        .children()

      const filter =
        children.length > 0
          ? {
            where: {
              ...args.where,
              OR: children.map(({ slug }) => ({ category: { slug } })),
            },
          }
          : {
            where: {
              ...args.where,
              category: { slug: category.slug },
            },
          }
      const { first, skip } = args
      const products = await ctx.db.query.products(
        { first, skip, orderBy, where, ...filter },
        info
      )
      return products
    }
>>>>>>> Finish products

  async me(parent, args, ctx: Context) {
    const { id } = await getUserRequestObject(ctx)
    return ctx.prisma.user({ id })
  },

  brand: (parent, args, ctx: Context, info) => ctx.db.query.brand(args, info),

  brands: async (parent, args, ctx: Context, info) => {
    const brands = await ctx.db.query.brands(args, info)
    const brandsWithProducts = brands.filter(brand => {
      return brand?.products?.length > 0
    })
    return brandsWithProducts
  },

  product: (parent, args, ctx: Context, info) =>
    ctx.db.query.product(args, info),

  productRequests: (parent, args, ctx: Context, info) =>
    ctx.db.query.productRequests(args, info),

  collections: (parent, args, ctx: Context, info) =>
    ctx.db.query.collections(args, info),

  collection: (parent, args, ctx: Context, info) =>
    ctx.db.query.collection(args, info),

  productFunctions: (parent, args, ctx: Context, info) =>
    ctx.db.query.productFunctions(args, info),

  categories: (parent, args, ctx: Context, info) =>
    ctx.db.query.categories(args, info),

  homepageProductRails: (parent, args, ctx: Context, info) =>
    ctx.db.query.homepageProductRails(args, info),

  homepageProductRail: (parent, args, ctx: Context, info) =>
    ctx.db.query.homepageProductRail(args, info),

  homepage: Homepage,

  faq: Faq,

  ...Search,

  ...Payment,
}
