import { Context } from "../utils"
import { head } from "lodash"
import { getCustomerFromContext, getUserFromContext } from "../auth/utils"

export const ReservationFeedback = {
  async reservationFeedback(parent, { }, ctx: Context, info) {
    const user = await getUserFromContext(ctx)
    const feedbacks = await ctx.db.query.reservationFeedbacks(
      {
        where: {
          user: { id: user.id },
          AND: {
            feedbacks_some: {
              isCompleted: false
            }
          }
        }
      },
      `
        {
          id
          comment
          rating
          feedbacks {
            id
            isCompleted
            variant {
              id
              product {
                images
                name
                retailPrice
              }
            }
            questions {
              id
              options
              question
              responses
              type
            }
          }
        }
      `
    )
    return head(feedbacks)
  },
}

export const ReservationFeedbackMutations = {
  async updateReservationFeedback(parent, { feedbackID, input }, ctx: Context, info) {
    const reservationFeedback = await ctx.prisma.updateReservationFeedback({
      where: { id: feedbackID },
      data: input
    })
    console.log("INPUT:", input)
    console.log("UPDATED:", reservationFeedback)
    return reservationFeedback !== null
  },
}
