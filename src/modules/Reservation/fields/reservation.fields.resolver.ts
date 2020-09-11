import { InterpretLogsService } from "@app/modules/Admin/services/interpretLogs.service"
import { ImageService } from "@modules/Image"
import { ImageSize } from "@modules/Image/image.types"
import { Args, Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

import { ReservationUtilsService } from "../services/reservation.utils.service"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(
    private readonly reservationService: ReservationUtilsService,
    private readonly imageService: ImageService,
    private readonly prisma: PrismaService,
    private readonly interpretLogs: InterpretLogsService
  ) {}

  @ResolveField()
  async returnAt(@Parent() parent) {
    const reservation = await this.prisma.client.reservation({
      id: parent.id,
    })
    return this.reservationService.returnDate(new Date(reservation?.createdAt))
  }

  @ResolveField()
  async adminLogs(@Parent() reservation, @Info() info) {
    return this.interpretLogs.interpretReservationLogs(
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
