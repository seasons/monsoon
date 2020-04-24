import { Parent, ResolveField, Resolver, Args } from "@nestjs/graphql"

import { PrismaService } from "@prisma/prisma.service"
import { ReservationUtilsService } from "../services/reservation.utils.service"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(
    private readonly reservationService: ReservationUtilsService,
    private readonly prisma: PrismaService
  ) {}

  @ResolveField()
  async returnDateDisplay(@Parent() parent) {
    const reservation = await this.prisma.client.reservation({
      id: parent.id,
    })
    return this.reservationService.formatReservationReturnDate(
      new Date(reservation?.createdAt)
    )
  }

  @ResolveField()
  async status(@Parent() parent, @Args() args) {
    const reservation = await this.prisma.client.reservation({
      id: parent.id,
    })
    const status = reservation.status
    if(args.display === true){
      switch(status) {
        case "InQueue":
          return "In queue"
        case "InTransit":
          return "In transit"
        case "OnHold":
          return "On hold"
        default:
          return status
      }
    } else {
      return status
    }
  }
}
