import { getUserId, Context } from "../utils"

export const Query = {
  me(parent, args, ctx: Context) {
    const id = getUserId(ctx)
    return ctx.prisma.user({ id })
  },
}
