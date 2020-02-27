import { Context } from "../utils"
import { head } from "lodash"
import { getUserRequestObject, getCustomerFromContext } from "../auth/utils"
import { ReservationCreateInput } from "../prisma"

export const Me = {
  user: async (parent, args, ctx: Context) => {
    const { id } = await getUserRequestObject(ctx)
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
    const reservations = await ctx.db.query.reservations(
      {
        where: {
          customer: {
            id: customer.id,
          },
        },
        orderBy: "createdAt_DESC",
      },
      info
    )

    const latestReservation: ReservationCreateInput = head(reservations)
    if (
      latestReservation &&
      !["Completed", "Cancelled"].includes(latestReservation.status)
    ) {
      return latestReservation
    }

    return null
  },

  async bag(parent, args, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    const bagItems = await ctx.db.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          saved: false,
        },
      },
      info
    )

    return bagItems
  },

  async savedItems(parent, args, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    const savedItems = await ctx.db.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          saved: true,
        },
      },
      info
    )

    return savedItems
  },
}
