import { Customer, User } from "@app/decorators"
import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { pick } from "lodash"

import { ReservationPhysicalProductService } from "../services/reservationPhysicalProduct.service"
import { ReservationService } from ".."

const ENSURE_TRACK_DATA_FRAGMENT = `fragment EnsureTrackData on Reservation {id products {seasonsUID}}`

@Resolver()
export class ReservationMutationsResolver {
  constructor(
    private readonly reservation: ReservationService,
    private readonly segment: SegmentService,
    private readonly prisma: PrismaService,
    private readonly reservationPhysicalProduct: ReservationPhysicalProductService
  ) {}

  @Mutation()
  async returnMultiItems(
    @Args() { trackingNumber, productStates, droppedOffBy }
  ) {
    if (droppedOffBy["UPS"] && trackingNumber === "") {
      throw new Error(
        `Must specify return package tracking number when processing reservation`
      )
    }

    return this.reservationPhysicalProduct.returnMultiItems(
      trackingNumber,
      productStates,
      droppedOffBy
    )
  }

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
    const itemsToReserve = await this.prisma.client.bagItem.findMany({
      where: {
        customer: { id: customer.id },
        status: { in: ["Reserved", "Added"] },
        saved: false,
      },
      select: { productVariant: { select: { id: true } } },
    })
    const productVariantIDs = itemsToReserve.map(a => a.productVariant.id)
    const returnData = await this.reservation.reserveItems({
      items: productVariantIDs,
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
      productVariantIDs,
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
    select,
    @Application() application
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

    const items = custWithData.bagItems.map(a => a.productVariant.id)
    const returnData = await this.reservation.reserveItems({
      items,
      shippingCode,
      customer: custWithData,
      select,
    })

    // Track the selection
    this.segment.track(custWithData.user.id, "Reserved Items", {
      ...pick(custWithData.user, ["email", "firstName", "lastName"]),
      reservationID: returnData.id,
      items,
      units: returnData.products.map(a => a.seasonsUID),
      application,
    })

    return returnData
  }

  @Mutation()
  async processReservation(@Args() { data }) {
    const { reservationNumber, productStates, trackingNumber = "" } = data

    if (trackingNumber === "") {
      throw new Error(
        `Must specify return package tracking number when processing reservation`
      )
    }

    const result = await this.reservation.processReservation(
      reservationNumber,
      productStates,
      trackingNumber
    )

    return result
  }

  @Mutation()
  async returnItems(@Args() { items }, @Customer() customer) {
    return this.reservation.returnItems(items, customer)
  }

  @Mutation()
  async cancelReturn(@Customer() customer) {
    return this.reservation.cancelReturn(customer)
  }
}
