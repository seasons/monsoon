import { Context, getUserIDHash, getCustomerFromUserID } from "../utils"
import { Homepage } from "./Homepage"
import { getUserRequestObject, getCustomerFromContext } from "../auth/utils"
import chargebee from "chargebee"

export const Query = {
  async me(parent, args, ctx: Context) {
    const { id } = await getUserRequestObject(ctx)
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

  homepageProductRails: (parent, args, ctx: Context, info) =>
    ctx.db.query.homepageProductRails(args, info),

  homepageProductRail: (parent, args, ctx: Context, info) =>
    ctx.db.query.homepageProductRail(args, info),

  homepage: Homepage,

  chargebeeCheckout: async (
    parent,
    { planID, userIDHash },
    ctx: Context,
    info
  ) => {
    // Is there a user in the db that corresponds to the given userIDHash?
    const allUsers = await ctx.prisma.users()
    let targetUser
    for (let user of allUsers) {
      let thisUsersIDHash = getUserIDHash(user.id)
      if (thisUsersIDHash === userIDHash) {
        targetUser = user
      }
    }
    if (targetUser === undefined) {
      throw new Error(`no user found for idHash: ${userIDHash}`)
    }

    // Get email, firstName, lastName, phoneNumber of targetUser
    const { email, firstName, lastName } = targetUser
    const correspondingCustomer = await getCustomerFromUserID(
      ctx.prisma,
      targetUser.id
    )
    let { phoneNumber } = await ctx.prisma
      .customer({ id: correspondingCustomer.id })
      .detail()

    // translate the passed planID into a chargebee-readable version
    let truePlanID
    if (planID == "AllAccess") {
      truePlanID = "all-access"
    } else if (planID == "Essential") {
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
            id: targetUser.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
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

    // Track the selection
    ctx.analytics.track({
      userId: targetUser.id,
      event: "Opened Checkout",
      properties: {
        plan: planID,
      },
    })

    return hostedPage
  },
}
