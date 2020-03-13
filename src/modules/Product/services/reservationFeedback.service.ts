import { DBService } from "../../../prisma/db.service"
import { Injectable } from "@nestjs/common"
import { ApolloError } from "apollo-server"
import {
  Customer,
  User,
  ID_Input,
  ReservationStatus,
  PhysicalProduct,
  Reservation,
  InventoryStatus,
  ReservationCreateInput,
} from "../../../prisma"
import { head } from "lodash"
import { PrismaClientService } from "../../../prisma/client.service"
import { QuestionType } from "../../../prisma"
import { ProductUtilsService } from "./product.utils.service"
import { ProductVariantService } from "./productVariant.service"
import { PhysicalProductService } from "./physicalProduct.utils.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { ShippingService } from "../../Shipping/services/shipping.service"
import { EmailService } from "../../Email/services/email.service"
import { RollbackError } from "../../../errors"
import * as Sentry from "@sentry/node"
import { ReservationUtilsService } from "./reservation.utils.service"
import { ShippoTransaction } from "../../Shipping/shipping.types"

interface PhysicalProductWithProductVariant extends PhysicalProduct {
  productVariant: { id: ID_Input }
}

export interface ReservationWithProductVariantData {
  id: ID_Input
  status: ReservationStatus
  reservationNumber: number
  products: PhysicalProductWithProductVariant[]
}

@Injectable()
export class ReservationFeedbackService {
  constructor(
    private readonly db: DBService,
    private readonly prisma: PrismaClientService,
    private readonly productUtils: ProductUtilsService,
    private readonly productVariantService: ProductVariantService,
    private readonly physicalProductService: PhysicalProductService,
    private readonly airtableService: AirtableService,
    private readonly shippingService: ShippingService,
    private readonly emails: EmailService,
    private readonly reservationUtils: ReservationUtilsService
  ) { }

  async getReservationFeedback(user) {
    const feedbacks = await this.prisma.client.reservationFeedbacks({
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
      const f = await this.prisma.client.reservationFeedback({
        id: feedbacks[0].id
      })
      console.log("FOUND F:", f)
      return f
    }
    return null
    console.log("FEEDBACKS", feedbacks)
    return feedbacks.length > 0 ? feedbacks[0] : null
  }
}
