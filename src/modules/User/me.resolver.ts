import {
  Resolver,
  Query,
  ResolveProperty,
  Context,
  Info,
  Args,
} from "@nestjs/graphql"
import { head } from "lodash"
import { prisma } from "../../prisma"
import { AuthService } from "./auth.service"
import { User } from "./user.decorator"
import { AuthError } from "../../auth/utils"
import { DBService } from "../../prisma/DB.service"

@Resolver("Me")
export class MeResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly db: DBService
  ) {}

  @Query()
  async me() {
    console.log("HERE")
    return {}
  }

  @ResolveProperty()
  async user(@Context() ctx, @CurrUser() user) {
    console.log("HERE 2")
    console.log(ctx.user)
    // console.log(ctx.req)
    console.log(ctx.req.user)
    console.log(user)
    const { id } = await getUserRequestObject(ctx)
    return ctx.prisma.user({ id })
  }

  // @ResolveProperty()
  // async customer(@Context() ctx, @Info() info) {
  //   console.log(ctx)
  //   const customer = await getCustomerFromContext(ctx)
  //   return await this.prisma.query.customer(
  //     {
  //       where: { id: customer.id },
  //     },
  //     info
  //   )
  // }

  // @ResolveProperty()
  // async activeReservation(@Context() ctx) {
  //   console.log(ctx)
  //   const customer = await getCustomerFromContext(ctx)
  //   const reservations = await ctx.prisma
  //     .customer({ id: customer.id })
  //     .reservations({
  //       orderBy: "createdAt_DESC",
  //     })

  //   const latestReservation = head(reservations)
  //   if (latestReservation && latestReservation.status !== "Completed") {
  //     return latestReservation
  //   }

  //   return null
  // }

  // @ResolveProperty()
  // async bag(@Context() ctx, @Info() info) {
  //   const customer = await getCustomerFromContext(ctx)

  //   const bagItems = await ctx.db.query.bagItems(
  //     {
  //       where: {
  //         customer: {
  //           id: customer.id,
  //         },
  //         saved: false,
  //       },
  //     },
  //     info
  //   )

  //   return bagItems
  // },

  //     async savedItems(parent, args, ctx: Context, info) {
  //       const customer = await getCustomerFromContext(ctx)

  //       const savedItems = await ctx.db.query.bagItems(
  //         {
  //           where: {
  //             customer: {
  //               id: customer.id,
  //             },
  //             saved: true,
  //           },
  //         },
  //         info
  //       )

  //       return savedItems
  //     },
  //   }
  // }

  // @ResolveProperty("user")
}
