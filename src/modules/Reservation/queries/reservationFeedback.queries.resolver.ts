import { User } from "@app/decorators"
import { Info, Query, Resolver } from "@nestjs/graphql"

import { ReservationFeedbackService } from "../services/reservationFeedback.service"

@Resolver()
export class ReservationFeedbackQueriesResolver {
  constructor(
    private readonly reservationFeedbackService: ReservationFeedbackService
  ) {}

  @Query()
  async reservationFeedback(@User() user, @Info() info) {
    return await this.reservationFeedbackService.getReservationFeedback(
      user,
      info
    )
  }
}
