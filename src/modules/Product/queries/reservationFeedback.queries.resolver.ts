import { Resolver, Query } from "@nestjs/graphql"
import { ReservationFeedbackService } from "../services/reservationFeedback.service"
import { User } from "@app/nest_decorators"

@Resolver()
export class ReservationFeedbackQueriesResolver {
  constructor(
    private readonly reservationFeedbackService: ReservationFeedbackService
  ) {}

  @Query()
  async reservationFeedback(@User() user) {
    return await this.reservationFeedbackService.getReservationFeedback(user)
  }
}
