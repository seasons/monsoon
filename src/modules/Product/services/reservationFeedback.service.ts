import { Injectable } from "@nestjs/common"
import { DBService } from "../../../prisma/db.service"
import { PrismaClientService } from "../../../prisma/client.service"
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

@Injectable()
export class ReservationFeedbackService {
  constructor(
    private readonly db: DBService,
    private readonly prisma: PrismaClientService
  ) { }

  async getReservationFeedback(user) {
    if (!user) return null
    const feedbacks = await this.db.query.reservationFeedbacks(
      {
        where: {
          user: { id: user.id },
          AND: {
            feedbacks_some: {
              isCompleted: false
            }
          }
        },
        orderBy: "createdAt_DESC",
      },
      RESERVATION_FEEDBACK_FRAGMENT
    )
    return feedbacks.length > 0 ? head(feedbacks) : null
  }

  async updateReservationFeedback(feedbackID, input) {
    await this.prisma.client.updateReservationFeedback({
      where: { id: feedbackID },
      data: input
    })
    const reservationFeedback = await this.db.query.reservationFeedback(
      { where: { id: feedbackID } },
      RESERVATION_FEEDBACK_FRAGMENT
    )
    return reservationFeedback
  }

}
