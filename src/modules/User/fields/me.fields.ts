import { Resolver, Info, ResolveField } from "@nestjs/graphql"
import { head } from "lodash"
import { User, Customer } from "../../../nest_decorators"
import { PrismaService } from "../../../prisma/prisma.service"

@Resolver("Me")
export class MeFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async user(@User() user) {
    return user
  }

  @ResolveField()
  async customer(@Customer() customer) {
    return customer
  }

  @ResolveField()
  async activeReservation(@Customer() customer) {
    const reservations = await this.prisma.client
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

  @ResolveField()
  async bag(@Info() info, @Customer() customer) {
    return await this.prisma.binding.query.bagItems(
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

  @ResolveField()
  async savedItems(@Info() info, @Customer() customer) {
    return await this.prisma.binding.query.bagItems(
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
