import { Analytics, Customer, User } from "@app/decorators"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { addFragmentToInfo } from "graphql-binding"

import { ReservationService } from ".."

@Resolver()
export class ReservationMutationsResolver {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async updateReservation(@Args() { data, where }, @Info() info) {
    return this.reservationService.updateReservation(data, where, info)
  }

  @Mutation()
  async reserveItems(
    @Args() { items },
    @User() user,
    @Customer() customer,
    @Info() info,
    @Analytics() analytics
  ) {
    const returnData = await this.reservationService.reserveItems(
      items,
      user,
      customer,
      addFragmentToInfo(info, `{products {seasonsUID}}`)
    )

    // Track the selection
    analytics.track({
      userId: user.id,
      event: "Reserved Items",
      properties: {
        email: user.email,
        items,
        units: returnData.products.map(a => a.seasonsUID),
      },
    })

    return returnData
  }

  @Mutation()
  async processReservation(@Args() { data }) {
    const { reservationNumber, productStates } = data

    const result = await this.reservationService.processReservation(
      reservationNumber,
      productStates
    )

    return result
  }
}
