import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

import { ReserveService } from "../services/reserve.service"
import { ReservationService } from ".."

const ENSURE_TRACK_DATA_FRAGMENT = `fragment EnsureTrackData on Reservation {id products {seasonsUID}}`

@Resolver()
export class ReservationMutationsResolver {
  constructor(
    private readonly reservation: ReservationService,
    private readonly reserve: ReserveService,
    private readonly segment: SegmentService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async updateReservation(@Args() { data, where }, @Select() select) {
    const result = await this.reservation.updateReservation(data, where, select)

    return result
  }

  @Mutation()
  async draftReservationLineItems(@Customer() customer) {
    const result = await this.reservation.draftReservationLineItems(customer)

    return result
  }

  @Mutation()
  async reserveItems(
    @Args() { shippingCode, options },
    @User() user,
    @Customer() customer,
    @Select({
      withFragment: ENSURE_TRACK_DATA_FRAGMENT,
    })
    select,
    @Application() application
  ) {
    const returnData = await this.reserve.reserveItems({
      pickupTime: {
        date: options?.pickupDate,
        timeWindowID: options?.timeWindowID,
      },
      shippingCode,
      customer,
      select,
    })

    // Track the selection
    this.segment.track(user.id, "Reserved Items", {
      ...pick(user, ["email", "firstName", "lastName"]),
      reservationID: returnData.id,
      units: returnData.products.map(a => a.seasonsUID),
      application,
    })

    return returnData
  }

  @Mutation()
  async reserveItemsForCustomer(
    @Args() { customerID, shippingCode },
    @Select({
      withFragment: ENSURE_TRACK_DATA_FRAGMENT,
    })
    select
  ) {
    const custWithData = await this.prisma.client.customer.findUnique({
      where: { id: customerID },
      select: {
        id: true,
        bagItems: {
          where: {
            saved: false,
          },
          select: { productVariant: { select: { id: true } } },
        },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    })
    const returnData = await this.reserve.reserveItems({
      shippingCode,
      customer: custWithData,
      select,
    })

    // Track the selection
    this.segment.track(custWithData.user.id, "Reserved Items", {
      ...pick(custWithData.user, ["email", "firstName", "lastName"]),
      reservationID: returnData.id,
      units: returnData.products.map(a => a.seasonsUID),
    })

    return returnData
  }

  @Mutation()
  async returnItems(@Args() { items, returnReasons }, @Customer() customer) {
    return this.reservation.returnItems(items, returnReasons, customer)
  }

  @Mutation()
  async cancelReturn(@Args() { bagItemId }, @Customer() customer) {
    return this.reservation.cancelReturn(customer, bagItemId)
  }
}
