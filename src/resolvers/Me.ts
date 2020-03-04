import { Context } from "../utils"
import { head } from "lodash"
import { getUserRequestObject, getCustomerFromContext } from "../auth/utils"
import { ReservationCreateInput } from "../prisma"
import { beamsClient } from "./Mutation/beamsClient"

export const Me = {
  beamsToken: async (parent, args, ctx: Context, info) => {
    const user = await getUserRequestObject(ctx)
    const beamsToken = beamsClient?.generateToken(user?.email) as any
    return beamsToken?.token
  },
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
    // FIXME: Remove reservationWithStatus after we add status to the info object in bag in harvest
    const customer = await getCustomerFromContext(ctx)
    const reservationWithStatus = await ctx.prisma
      .customer({ id: customer.id })
      .reservations({
        orderBy: "createdAt_DESC",
      })
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

    const latestReservationWithStatus = head(reservationWithStatus)
    const latestReservation: ReservationCreateInput = head(reservations)
    if (
      latestReservation &&
      latestReservationWithStatus &&
      !["Completed", "Cancelled"].includes(latestReservationWithStatus.status)
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
