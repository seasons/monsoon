import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { AdminActionLogWhereInput } from "@app/prisma"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { ImageSize } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { Args, Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"

import { ReservationService } from "../services/reservation.service"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly utils: UtilsService,
    private readonly imageService: ImageService,
    private readonly prisma: PrismaService
  ) {}

  @ResolveField()
  async returnAt(
    @Parent() parent,
    @Loader({
      params: { query: `reservations`, info: `{id createdAt receivedAt}` },
    })
    reservationLoader
  ) {
    const reservation = await reservationLoader.load(parent.id)
    return this.utils.getReservationReturnDate(reservation)
  }

  @ResolveField()
  async adminLogs(
    @Parent() reservation,
    @Info() info,
    @Loader({
      params: {
        query: `adminActionLogs`,
        formatWhere: keys => ({
          AND: [
            { entityId_in: keys },
            { tableName: "Reservation" },
          ] as AdminActionLogWhereInput,
        }),
        keyToDataRelationship: "OneToMany",
        getKeys: a => [a.entityId],
      },
      includeInfo: true,
    })
    prismaLoader: PrismaDataLoader<string>
  ) {
    const logs = await prismaLoader.load(reservation.id)
    return this.reservationService.interpretReservationLogs(logs as any)
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
