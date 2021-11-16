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
          reservationPhysicalProduct: {
            select: {
              status: true,
            },
          },
        }),
      },
    })
    bagItemLoader
  ) {
    const currentBagItem = await bagItemLoader.load(parent.id)
    if (currentBagItem.status !== "Reserved") {
      return false
    }

    const physicalProductId = currentBagItem.physicalProductId
    if (!physicalProductId) {
      throw new Error(
        `Reserved bag item ${currentBagItem.id} has no physical product on it`
      )
    }

    const hasCorrectStatus = ["Queued", "Picked", "Hold"].includes(
      currentBagItem.reservationPhysicalProduct.status
    )

    return hasCorrectStatus
  }
}
