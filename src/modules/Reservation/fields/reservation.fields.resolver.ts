import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "../../../prisma/prisma.service"
import { ReservationUtilsService } from "../services/reservationUtils.service"
// import { formatReservationReturnDate } from "../services/reservationUtils.service"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationService: ReservationUtilsService
  ) {}

  @ResolveField()
  async products(@Parent() parent) {
    const reservationProducts = this.prisma.client
      .reservation({
        id: parent.id,
      })
      .products()
    return reservationProducts
  }

  @ResolveField()
  returnDateDisplay() {
    return this.reservationService.formatReservationReturnDate(
      new Date(Date.now())
    )
  }
}
