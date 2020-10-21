import { ImageSize } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { Args, Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

import { ReservationService } from "../services/reservation.service"
import { ReservationUtilsService } from "../services/reservation.utils.service"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(
    private readonly reservationUtils: ReservationUtilsService,
    private readonly reservationService: ReservationService,
    private readonly imageService: ImageService,
    private readonly prisma: PrismaService
  ) {}

  @ResolveField()
  async returnAt(@Parent() parent) {
    const reservation = await this.prisma.client.reservation({
      id: parent.id,
    })
    return this.reservationUtils.returnDate(new Date(reservation?.createdAt))
  }

  @ResolveField()
  async adminLogs(@Parent() reservation, @Info() info) {
    return this.reservationService.interpretReservationLogs(
      await this.prisma.binding.query.adminActionLogs(
        {
          where: {
            AND: [{ entityId: reservation.id }, { tableName: "Reservation" }],
          },
        },
        info
      )
    )
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
              images {
                id
                url
                updatedAt
              }
            }
          }
        }
      }
      `
    )

    return reservation.products.map(async product => {
      const image = product.productVariant.product.images?.[0]

      return {
        url: await this.imageService.resizeImage(image?.url, size, {
          w: width,
          h: height,
        }),
      }
    })
  }
}
