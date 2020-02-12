import { Resolver, Query } from "@nestjs/graphql"
import { Context } from "../../utils"
import { head } from "lodash"
import { getUserRequestObject, getCustomerFromContext } from "../../auth/utils"

@Resolver("Me")
export class MeResolver {
  @Query()
  async me() {
    return {
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
        const reservations = await ctx.prisma
          .customer({ id: customer.id })
          .reservations({
            orderBy: "createdAt_DESC",
          })

        const latestReservation = head(reservations)
        if (latestReservation && latestReservation.status !== "Completed") {
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
  }
}
