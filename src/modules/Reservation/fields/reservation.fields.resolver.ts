import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { ImageSize } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"

import { ReservationService } from "../services/reservation.service"

@Resolver("Reservation")
export class ReservationFieldsResolver {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly utils: UtilsService,
    private readonly imageService: ImageService
  ) {}

  @ResolveField()
  async returnAt(
    @Parent() parent,
    @Loader({
      params: {
        model: "Reservation",
        select: Prisma.validator<Prisma.ReservationSelect>()({
          id: true,
          createdAt: true,
          receivedAt: true,
        }),
      },
    })
    reservationLoader
  ) {
    const reservation = await reservationLoader.load(parent.id)
    return this.utils.getReservationReturnDate(reservation)
  }

  @ResolveField()
  async adminLogs(
    @Parent() reservation,
    @Loader({
      params: {
        model: "AdminActionLog",
        formatWhere: keys =>
          Prisma.validator<Prisma.AdminActionLogWhereInput>()({
            AND: [{ entityId: { in: keys } }, { tableName: "Reservation" }],
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
    @Args("size") size: ImageSize,
    @Loader({
      params: {
        model: "Reservation",
        select: Prisma.validator<Prisma.ReservationSelect>()({
          products: {
            select: {
              id: true,
              productVariant: {
                select: {
                  product: {
                    select: {
                      images: {
                        select: { id: true, url: true, updatedAt: true },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      },
    })
    reservationLoader
  ) {
    const reservation = await reservationLoader.load(parent.id)

    return reservation.products.map(async product => {
      const image = (product.productVariant as any).product.images?.[0]

      return {
        url: await this.imageService.resizeImage(image?.url, size, {
          w: width,
          h: height,
        }),
      }
    })
  }
}
