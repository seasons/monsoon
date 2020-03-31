import { ResolveField, Resolver } from "@nestjs/graphql"
import { ReservationUtilsService } from "../services/reservationUtils.service"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(private readonly reservationService: ReservationUtilsService) {}

  @ResolveField()
  returnDateDisplay() {
    return this.reservationService.formatReservationReturnDate(
      new Date(Date.now())
    )
  }
}
