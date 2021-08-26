import { Customer } from "@app/decorators"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { ImageSize } from "@modules/Image/image.types.d"
import { ImageService } from "@modules/Image/services/image.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PhysicalProductDamageType, Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { head } from "lodash"

@Resolver("BagItem")
export class BagItemFieldsResolver {
  @ResolveField()
  async isSwappable(
    @Parent() parent,
    @Loader({
      params: {
        model: "BagItem",
        select: Prisma.validator<Prisma.BagItemSelect>()({
          id: true,
          status: true,
          physicalProduct: {
            select: {
              id: true,
            },
          },
          physicalProductId: true,
          productVariant: {
            select: {
              id: true,
            },
          },
          customer: {
            select: {
              id: true,
            },
          },
        }),
      },
    })
    bagItemLoader,
    @Loader({
      params: {
        model: "Reservation",
        select: Prisma.validator<Prisma.ReservationSelect>()({
          customer: { select: { id: true } },
          status: true,
          newProducts: { select: { id: true } },
        }),
        formatWhere: (compositeKeys, ctx) => {
          const customerIds = []
          const physicalProductIds = []
          for (const compositeKey of compositeKeys) {
            const [custId, physProdId] = compositeKey.split(",")
            customerIds.push(custId)
            physicalProductIds.push(physProdId)
          }
          return Prisma.validator<Prisma.ReservationWhereInput>()({
            customer: { id: { in: customerIds } },
            newProducts: { some: { id: { in: physicalProductIds } } },
          })
        },
        getKeys: reservation => {
          const customerId = reservation.customer.id
          const physicalProductIds = reservation.newProducts.map(a => a.id)
          return physicalProductIds.map(a => `${customerId},${a}`)
        },
        orderBy: { createdAt: "desc" },
        keyToDataRelationship: "ManyToMany",
      },
    })
    reservationLoader
  ) {
    const currentBagItem = await bagItemLoader.load(parent.id)
    if (currentBagItem.status !== "Reserved") {
      return false
    }

    const customerId = currentBagItem.customer.id
    const physicalProductId = currentBagItem.physicalProduct?.id
    if (!physicalProductId) {
      throw new Error(
        `Reserved bag item ${currentBagItem.id} has no physical product on it`
      )
    }

    const possibleReservations = await reservationLoader.load(
      `${customerId},${physicalProductId}`
    )

    const relevantReservation = head(possibleReservations)
    const isQueueOrHold = ["Queued", "Hold"].includes(
      relevantReservation.status
    )

    return isQueueOrHold
  }
}
