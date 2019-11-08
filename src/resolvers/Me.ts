import { Context } from "../utils"
import { head } from "lodash"
import { getUserId, getCustomerFromContext } from "../auth/utils"

export const Me = {
  user: async (parent, args, ctx: Context) => {
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
  activeReservation: async (parent, args, ctx: Context, info) => {
    const customer = await getCustomerFromContext(ctx)
    const reservations = await ctx.prisma
      .customer({ id: customer.id })
      .reservations({
        orderBy: "createdAt_DESC",
      })

    const firstReservation = head(reservations)
    return firstReservation
  },
}
