import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { ImageResizeService } from "@modules/Image"
import { ImageSize } from "@modules/Image/image.types"
import { PrismaService } from "@prisma/prisma.service"
import { ProductUtilsService } from "@modules/Product"
import { ReservationUtilsService } from "../services/reservation.utils.service"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(
    private readonly productUtils: ProductUtilsService,
    private readonly reservationService: ReservationUtilsService,
    private readonly imageResizeService: ImageResizeService,
    private readonly prisma: PrismaService
  ) {}

  @ResolveField()
  async returnAt(@Parent() parent) {
    const reservation = await this.prisma.client.reservation({
      id: parent.id,
    })
    return this.reservationService.returnDate(new Date(reservation?.createdAt))
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

    return await Promise.all(
      reservation.products.map(async physicalProduct => {
        const images = await this.productUtils.getProductImagesByID(
          physicalProduct.productVariant.product.id
        )
        const imageURL = images?.[0]?.url || ""

        return {
          url: this.imageResizeService.imageResize(imageURL, size, {
            w: width,
            h: height,
          }),
        }
      })
    )
  }

  @ResolveField()
  async status(@Parent() parent, @Args() args) {
    const reservation = await this.prisma.client.reservation({
      id: parent.id,
    })
    const status = reservation.status
    if (args.display === true) {
      switch (status) {
        case "InQueue":
          return "In queue"
        case "InTransit":
          return "In transit"
        case "OnHold":
          return "On hold"
        default:
          return status
      }
    } else {
      return status
    }
  }
}
