import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { Injectable } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"

const RESERVATION_FEEDBACK_SELECT = {
  id: true,
  comment: true,
  rating: true,
  feedbacks: {
    select: {
      id: true,
      isCompleted: true,
      variant: {
        select: {
          id: true,
          product: {
            select: {
              id: true,
              images: { select: { id: true, url: true } },
              name: true,
              retailPrice: true,
            },
          },
        },
      },
      questions: {
        select: {
          id: true,
          options: true,
          question: true,
          responses: true,
          type: true,
        },
      },
    },
  },
} as Prisma.ReservationFeedbackSelect

@Injectable()
export class ReservationFeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  async updateProductReservationFeedback(
    reservationFeedbackID,
    productReservationID,
    input,
    responses
  ) {
    const promises = []
    const responsesArray = Object.keys(responses)
    for (const key of responsesArray) {
      promises.push(
        this.prisma.client2.productVariantFeedbackQuestion.update({
          where: {
            id: key,
          },
          data: {
            responses: this.queryUtils.createScalarListMutateInput(
              responses[key],
              key,
              "update"
            ),
          },
        })
      )
    }

    promises.push(
      this.prisma.client2.reservationFeedback.update({
        where: {
          id: reservationFeedbackID,
        },
        data: {
          respondedAt: new Date(),
        },
      })
    )

    promises.push(
      this.prisma.client2.productVariantFeedback.update({
        where: {
          id: productReservationID,
        },
        data: input,
      })
    )

    const result = await this.prisma.client2.$transaction(promises)

    const feedback = this.prisma.sanitizePayload(
      result.pop(),
      "ProductVariantFeedback"
    )

    return feedback
  }

  async getReservationFeedback(user, select) {
    if (!user) return null
    const _feedback = await this.prisma.client2.reservationFeedback.findFirst({
      where: {
        user: { id: user.id },
        AND: {
          feedbacks: {
            some: {
              isCompleted: false,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      select: select ?? RESERVATION_FEEDBACK_SELECT,
    })
    const feedback = this.prisma.sanitizePayload(
      _feedback,
      "ReservationFeedback"
    )
    return feedback
  }

  async updateReservationFeedback(feedbackID, input) {
    const feedback = await this.prisma.client2.reservationFeedback.update({
      where: { id: feedbackID },
      data: input,
      select: RESERVATION_FEEDBACK_SELECT,
    })
    return this.prisma.sanitizePayload(feedback, "ReservationFeedback")
  }
}
