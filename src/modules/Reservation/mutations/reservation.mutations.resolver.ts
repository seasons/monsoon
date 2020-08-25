import { Customer, User } from "@app/decorators"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { addFragmentToInfo } from "graphql-binding"

import { ReservationService } from ".."

@Resolver()
export class ReservationMutationsResolver {
  constructor(
    private readonly reservation: ReservationService,
    private readonly segment: SegmentService
  ) {}

  @Mutation()
  async updateReservation(@Args() { data, where }, @Info() info) {
    return this.reservation.updateReservation(data, where, info)
  }

  @Mutation()
  async reserveItems(
    @Args() { items },
    @User() user,
    @Customer() customer,
    @Info() info
  ) {
    const returnData = await this.reservation.reserveItems(
      items,
      user,
      customer,
      addFragmentToInfo(info, `{products {seasonsUID}}`)
    )

    // Track the selection
    this.segment.client.track({
      userId: user.id,
      event: "Reserved Items",
      properties: {
        email: user.email,
        reservationID: returnData.id,
        items,
        units: returnData.products.map(a => a.seasonsUID),
      },
    })

    return returnData
  }

  @Mutation()
  async processReservation(@Args() { data }) {
    const { reservationNumber, productStates } = data

    const result = await this.reservation.processReservation(
      reservationNumber,
      productStates
    )

    return result
  }
}
