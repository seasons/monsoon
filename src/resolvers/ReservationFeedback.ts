import { Context } from "../utils"
import { getCustomerFromContext, getUserFromContext } from "../auth/utils"

export const ReservationFeedback = {
  async reservationFeedback(parent, { }, ctx: Context, info) {
    const user = await getUserFromContext(ctx)
    const feedbacks = await ctx.prisma.reservationFeedbacks({
      where: {
        user: {
          id: user.id
        },
        AND: {
          feedbacks_some: {
            isCompleted: false
          }
        }
      }
    })
    if (feedbacks.length > 0) {
      const f = await ctx.prisma.reservationFeedback({
        id: feedbacks[0].id
      })
      console.log("FOUND F:", f)
      return f
    }
    return null
    console.log("FEEDBACKS", feedbacks)
    return feedbacks.length > 0 ? feedbacks[0] : null
  },

}
