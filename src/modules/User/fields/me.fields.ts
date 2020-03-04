import {
  Resolver,
  Query,
  ResolveProperty,
  Context,
  Info,
} from "@nestjs/graphql"
import { head } from "lodash"
import { prisma } from "../../../prisma"
import { AuthService } from "../services/auth.service"
import { User } from "../../../nest_decorators"
import { DBService } from "../../../prisma/DB.service"

@Resolver("Me")
export class MeFieldsResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly db: DBService
  ) {}

  @ResolveProperty()
  async user(@User() user) {
    return user
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
    if (
      latestReservation &&
      !["Completed", "Cancelled"].includes(latestReservation.status)
    ) {
      return latestReservation
    }

    return null
  }

  @ResolveProperty()
  async bag(@Context() ctx, @Info() info) {
    const customer = await this.authService.getCustomerFromContext(ctx)
    return await this.db.query.bagItems(
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
