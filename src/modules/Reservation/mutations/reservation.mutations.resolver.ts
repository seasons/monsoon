import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

import { ReservationService } from ".."

@Resolver()
export class ReservationMutationsResolver {
  constructor(
    private readonly reservation: ReservationService,
    private readonly segment: SegmentService
  ) {}

  @Mutation()
  async updateReservation(@Args() { data, where }, @Select() select) {
    const result = await this.reservation.updateReservation(data, where, select)

    return result
  }

  @Mutation()
  async draftReservationLineItems(@Args() { hasFreeSwap }, @User() user) {
    const result = await this.reservation.draftReservationLineItems(
      user,
      hasFreeSwap
    )

    return result
  }

  @Mutation()
  async reserveItems(
    @Args() { items, shippingCode },
    @User() user,
    @Customer() customer,
    @Select({
      withFragment: `fragment EnsureTrackData on Reservation {id products {seasonsUID}}`,
    })
    select,
    @Application() application
  ) {
    const returnData = await this.reservation.reserveItems(
      items,
      shippingCode,
      user,
      customer,
      select
    )

    // Track the selection
    this.segment.track(user.id, "Reserved Items", {
      ...pick(user, ["email", "firstName", "lastName"]),
      reservationID: returnData.id,
      items,
      units: returnData.products.map(a => a.seasonsUID),
      application,
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

  @Mutation()
  async returnItems(@Args() { items }, @Customer() customer) {
    return this.reservation.returnItems(items, customer)
  }
}
