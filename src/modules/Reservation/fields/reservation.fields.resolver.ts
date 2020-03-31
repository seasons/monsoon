import { ResolveField, Resolver, Parent } from "@nestjs/graphql"
import { ReservationUtilsService } from "../services/reservation.utils.service"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(private readonly reservationService: ReservationUtilsService) {}

  @ResolveField()
  returnDateDisplay(@Parent() parent) {
    return this.reservationService.formatReservationReturnDate(
      parent?.createdAt
    )
  }
}
