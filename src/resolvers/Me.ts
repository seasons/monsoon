import { Context } from "../utils"

import { getUserId, getCustomerFromContext } from "../auth/utils"

export const Me = {
  user: async (parent, args, ctx: Context) => {
    console.log(parent)
    const { id } = await getUserId(ctx)
    return ctx.prisma.user({ id })
  },
  customer: async (parent, args, ctx: Context) => {
    const customer = await getCustomerFromContext(ctx)
    return customer
  },
}
