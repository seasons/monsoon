import { Analytics, Customer, User } from "@app/nest_decorators"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"

import { PrismaService } from "@app/prisma/prisma.service"
import { ReservationService } from ".."

@Resolver()
export class ReservationMutationsResolver {
  constructor(private readonly reservationService: ReservationService) {}

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
}
