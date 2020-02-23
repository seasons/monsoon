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
    return {}
  }

  @ResolveProperty()
  async user(@User() requestUser) {
    if (!requestUser) {
      return new AuthError()
    }
    const { id } = requestUser
    return prisma.user({ id })
  }

  @ResolveProperty()
  async customer(@Context() ctx, @Info() info) {
    const customer = await this.authService.getCustomerFromContext(ctx)
    return await this.db.query.customer(
      {
        where: { id: customer.id },
      },
      info
    )
  }

  @ResolveProperty()
  async activeReservation(@Context() ctx) {
    const customer = await this.authService.getCustomerFromContext(ctx)
    const reservations = await prisma
      .customer({ id: customer.id })
      .reservations({ orderBy: "createdAt_DESC" })
    const latestReservation = head(reservations)
    if (latestReservation && latestReservation.status !== "Completed") {
      return latestReservation
    }

    return null
  }

  @ResolveProperty()
  async bag(@Context() ctx, @Info() info) {
    const customer = await this.authService.getCustomerFromContext(ctx)
    const bag = await this.db.query.bagItems(
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
    return bag
  }

  @ResolveProperty()
  async savedItems(@Context() ctx, @Info() info) {
    const customer = await this.authService.getCustomerFromContext(ctx)
    return await this.db.query.bagItems(
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
  }
}
