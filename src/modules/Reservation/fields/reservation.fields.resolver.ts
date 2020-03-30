import { Resolver, ResolveField } from "@nestjs/graphql"
import { PrismaService } from "../../../prisma/prisma.service"
import { formatReservationReturnDate } from "../services/reservationUtils.service"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async products(parent) {
    const reservationProducts = this.prisma.client.reservation({
      id: parent.id,
    })
    reservationProducts.returnDateDisplay = formatReservationReturnDate(
      new Date(Date.now())
    )
    return reservationProducts
  }
  @ResolveField()
  returnDateDisplay
}
