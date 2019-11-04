import { Context } from "../utils"

import { getUserId, getCustomerFromContext } from "../auth/utils"

export const Me = {
  user: async (parent, args, ctx: Context) => {
    console.log(parent)
    const { id } = await getUserId(ctx)
    return ctx.prisma.user({ id })
  },
  customer: async (parent, args, ctx: Context, info) => {
    const customer = await getCustomerFromContext(ctx)
    return await ctx.db.query.customer(
      {
        where: { id: customer.id },
      },
      info
    )
  },
}
