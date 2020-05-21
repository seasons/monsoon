import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { head } from "lodash"

const RESERVATION_FEEDBACK_FRAGMENT = `
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
           id
           images {
             id
             url
           }
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

@Injectable()
export class ReservationFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async getReservationFeedback(user) {
    if (!user) return null
    const feedbacks = await this.prisma.binding.query.reservationFeedbacks(
      {
        where: {
          user: { id: user.id },
          AND: {
            feedbacks_some: {
              isCompleted: false,
            },
          },
        },
        orderBy: "createdAt_DESC",
      },
      RESERVATION_FEEDBACK_FRAGMENT
    )
    const reservationFeedbacks = feedbacks.length > 0 ? head(feedbacks) : null
    return reservationFeedbacks
  }

  async updateReservationFeedback(feedbackID, input) {
    await this.prisma.client.updateReservationFeedback({
      where: { id: feedbackID },
      data: input,
    })
    const reservationFeedback = await this.prisma.binding.query.reservationFeedback(
      { where: { id: feedbackID } },
      RESERVATION_FEEDBACK_FRAGMENT
    )
    return reservationFeedback
  }
}
