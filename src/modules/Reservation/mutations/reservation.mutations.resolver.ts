import { Analytics, Customer, User } from "@app/decorators"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"

import { ReservationService } from ".."

@Resolver()
export class ReservationMutationsResolver {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async updateReservation(@Args() args, @Info() info) {
    return this.prisma.binding.mutation.updateReservation(args, info)
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
      info
    )

    // Track the selection
    analytics.track({
      userId: user.id,
      event: "Reserved Items",
      properties: {
        items,
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
