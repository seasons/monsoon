import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { PrismaService } from "@prisma/prisma.service"
import { ReservationUtilsService } from "../services/reservation.utils.service"
import head from "lodash"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(
    private readonly reservationService: ReservationUtilsService,
    private readonly prisma: PrismaService
  ) {}

  @ResolveField()
  async returnDateDisplay(@Parent() parent) {
    const reservation = await this.prisma.client.reservation({
      id: parent.id,
    })
    return this.reservationService.formatReservationReturnDate(
      new Date(reservation?.createdAt)
    )
  }

  @ResolveField()
  async returnAt(@Parent() parent) {
    const reservation = await this.prisma.client.reservation({
      id: parent.id,
    })
    return new Date(reservation?.createdAt).toUTCString()
  }

  @ResolveField()
  async images(@Parent() parent) {
    const reservation = await this.prisma.binding.query.reservation(
      {
        where: {
          id: parent.id,
        },
      },
      `
      {
        products {
          id
          productVariant {
            product {
              images
            }
          }
        }
      }
      `
    )
    const products = reservation.products
    const firstImages = products.map(product => {
      return head(product.productVariant.product.images)
    })

    return firstImages
  }
}
