import { Context } from "../utils"
import { Homepage } from "./Homepage"
import { getUserId } from "../auth/utils"
import chargebee from "chargebee"

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

  chargebeeCheckout: async (parent, args, ctx: Context, info) => {
    // get the user's info
    const { id } = await getUserId(ctx)
    const { email, firstName, lastName } = await ctx.prisma.user({ id })
    console.log(email)

    // translate the passed planID into a chargebee-readable version
    let truePlanID
    if (args.planID == "AllAccess") {
      truePlanID = "all-access"
    } else if (args.planID == "Essential") {
      truePlanID = "essential"
    } else {
      throw new Error("unrecognized planID")
    }

    // make the call to chargebee
    chargebee.configure({
      site: process.env.CHARGEBEE_SITE,
      api_key: process.env.CHARGEE_API_KEY,
    })
    const hostedPage = await new Promise((resolve, reject) => {
      chargebee.hosted_page
        .checkout_new({
          subscription: {
            plan_id: truePlanID,
          },
          customer: {
            id: id,
            email: email,
            first_name: firstName,
            last_name: lastName,
          },
        })
        .request(function(error, result) {
          if (error) {
            reject(error)
          } else {
            resolve(result.hosted_page)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })
    return hostedPage
  },
}
