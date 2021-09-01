import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { Prisma } from "@prisma/client"
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
          physicalProductId: true,
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
        formatWhere: compositeKeys => {
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
    const physicalProductId = currentBagItem.physicalProductId
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
