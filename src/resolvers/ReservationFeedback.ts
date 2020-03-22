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
              retailPrice
              product {
                name
                images
              }
            }
            questions {
              id
              question
              options
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
