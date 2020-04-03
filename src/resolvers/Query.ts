import { Context } from "../utils"
import { Homepage } from "./Homepage"
import { Faq } from "./Faq"
import { getUserRequestObject } from "../auth/utils"

import { Payment } from "./Payment"
import { Search } from "./Search"
import { Products } from "./Products"

export const Query = {
  ...Products,

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
