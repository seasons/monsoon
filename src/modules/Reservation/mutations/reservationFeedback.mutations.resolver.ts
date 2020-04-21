import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { ReservationFeedbackService } from "../services/reservationFeedback.service"

@Resolver()
export class ReservationFeedbackMutationsResolver {
  constructor(
    private readonly reservationFeedbackService: ReservationFeedbackService
  ) {}

  @Mutation()
  async updateReservationFeedback(@Args() { feedbackID, input }) {
    const reservationFeedback = await this.reservationFeedbackService.updateReservationFeedback(
      feedbackID,
      input
    )
    return reservationFeedback
  }
}
