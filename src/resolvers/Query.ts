import { Context, getUserIDHash, getCustomerFromUserID } from "../utils"
import { Homepage } from "./Homepage"
import { Faq } from "./Faq"
import { getUserRequestObject } from "../auth/utils"
import chargebee from "chargebee"
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
      return brand.products.length > 0
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

  chargebeeCheckout: async (
    parent,
    { planID, userIDHash },
    ctx: Context,
    info
  ) => {
    // Is there a user in the db that corresponds to the given userIDHash?
    const allUsers = await ctx.prisma.users()
    let targetUser
    for (const user of allUsers) {
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
    const { phoneNumber } = await ctx.prisma
      .customer({ id: correspondingCustomer.id })
      .detail()

    // translate the passed planID into a chargebee-readable version
    let truePlanID
    if (planID === "AllAccess") {
      truePlanID = "all-access"
    } else if (planID === "Essential") {
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
            email,
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
          },
        })
        .request((error, result) => {
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

  ...Search,
}
