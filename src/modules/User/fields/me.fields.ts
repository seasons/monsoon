import {
  Resolver,
  ResolveProperty,
  Context,
  Info,
} from "@nestjs/graphql"
import { head } from "lodash"
import { prisma } from "../../../prisma"
import { User, Customer } from "../../../nest_decorators"
import { DBService } from "../../../prisma/DB.service"

@Resolver("Me")
export class MeFieldsResolver {
  constructor(private readonly db: DBService) { }

  @ResolveProperty()
  async user(@User() user) {
    return user
  }

  @ResolveProperty()
  async customer(@Customer() customer) {
    return {}
  }

  @ResolveProperty()
  async activeReservation(@Customer() customer) {
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
  async bag(@Info() info, @Customer() customer) {
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
  async savedItems(@Context() ctx, @Info() info, @Customer() customer) {
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
