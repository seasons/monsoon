import { Resolver, Info, ResolveField } from "@nestjs/graphql"
import { head } from "lodash"
import { User, Customer } from "@app/nest_decorators"
import { PrismaService } from "@prisma/prisma.service"

@Resolver("Me")
export class MeFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async user(@User() user) {
    return user
  }

  @ResolveField()
  async customer(@Customer() customer, @Info() info) {
    return this.prisma.binding.query.customer(
      {
        where: { id: customer.id },
      },
      info
    )
  }

  @ResolveField()
  async activeReservation(@Customer() customer, @Info() info) {
    const reservations = await this.prisma.client
      .customer({ id: customer.id })
      .reservations({ orderBy: "createdAt_DESC" })
    const latestReservation = head(reservations)
    if (
      latestReservation &&
      !["Completed", "Cancelled"].includes(latestReservation.status)
    ) {
      return await this.prisma.binding.query.reservation(
        {
          where: { id: latestReservation.id },
        },
        info
      )
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
