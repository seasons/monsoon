import { User } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { Info, Query, Resolver } from "@nestjs/graphql"

import { ReservationFeedbackService } from "../services/reservationFeedback.service"

@Resolver()
export class ReservationFeedbackQueriesResolver {
  constructor(
    private readonly reservationFeedbackService: ReservationFeedbackService
  ) {}

  @Query()
  async reservationFeedback(@User() user, @Select() select) {
    return await this.reservationFeedbackService.getReservationFeedback(
      user,
      select
    )
  }
}
