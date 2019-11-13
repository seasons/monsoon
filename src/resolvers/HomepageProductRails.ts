import { Context } from "../utils"

export const HomepageProductRails = (parent, args, ctx: Context, info) => {
  return ctx.db.query.homepageProductRail(args, info)
}