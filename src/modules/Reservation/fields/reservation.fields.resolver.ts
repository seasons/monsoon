import { Parent, ResolveField, Resolver, Args } from "@nestjs/graphql"

import { PrismaService } from "@prisma/prisma.service"
import { ReservationUtilsService } from "../services/reservation.utils.service"
import { ImageSize, ImageResizeService } from "@app/modules/Utils"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(
    private readonly reservationService: ReservationUtilsService,
    private readonly imageResizeService: ImageResizeService,
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
  async images(
    @Parent() parent,
    @Args("width") width: number,
    @Args("height") height: number,
    @Args("size") size: ImageSize
  ) {
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
      const image = product.productVariant.product.images?.[0]
      return {
        url: this.imageResizeService.imageResize(image?.url, size, {
          w: width,
          h: height,
        }),
      }
    })

    return firstImages
  }
}
