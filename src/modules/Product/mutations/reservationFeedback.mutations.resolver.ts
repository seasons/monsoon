import { Resolver, Mutation, Args, Info } from "@nestjs/graphql"
import { PrismaClientService } from "../../../prisma/client.service"
import { User, Customer, Analytics } from "../../../nest_decorators"
import { ReservationFeedbackService } from "../services/reservationFeedback.service"

@Resolver()
export class ReservationFeedbackMutationsResolver {
  constructor(
    private readonly prisma: PrismaClientService,
    private readonly reservationFeedbackService: ReservationFeedbackService,
  ) { }

  @Mutation()
  async updateReservationFeedback(@Args() { feedbackID, input }) {
    const reservationFeedback = await this.reservationFeedbackService.updateReservationFeedback(feedbackID, input)
    return reservationFeedback
  }

}
