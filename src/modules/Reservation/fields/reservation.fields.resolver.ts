import { ResolveField, Resolver, Parent, Info } from "@nestjs/graphql"
import { ReservationUtilsService } from "../services/reservation.utils.service"
import { PrismaService } from "../../../prisma/prisma.service"
import { Customer } from "../../../nest_decorators"

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
}
