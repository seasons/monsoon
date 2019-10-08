import {
  Context,
  validateAndParseIdToken,
  createPrismaUser,
} from "../../auth/utils"

export const auth = {
  async authenticate(parent, { idToken }, ctx: Context, info) {
    let userToken = null
    try {
      userToken = await validateAndParseIdToken(idToken)
    } catch (err) {
      throw new Error(err.message)
    }
    const auth0id = userToken.sub.split("|")[1]
    let user = await ctx.db.query.user({ where: { auth0id } }, info)
    if (!user) {
      user = createPrismaUser(ctx, userToken)
    }
    return user
  },
}
