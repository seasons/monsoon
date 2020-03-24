import { Context } from "../utils"
import { head } from "lodash"
import { getCustomerFromContext, getUserFromContext } from "../auth/utils"

const ReservationFeedbackFragment = `
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

export const ReservationFeedback = {
  async reservationFeedback(parent, { }, ctx: Context, info) {
    let user
    try {
      user = await getUserFromContext(ctx)
    } catch (error) {
      return null
    }
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
      ReservationFeedbackFragment
    )
    return head(feedbacks)
  },
}

export const ReservationFeedbackMutations = {
  async updateReservationFeedback(parent, { feedbackID, input }, ctx: Context, info) {
    await ctx.prisma.updateReservationFeedback({
      where: { id: feedbackID },
      data: input
    })
    const reservationFeedback = await ctx.db.query.reservationFeedback(
      { where: { id: feedbackID } },
      ReservationFeedbackFragment
    )
    return reservationFeedback
  },
}
