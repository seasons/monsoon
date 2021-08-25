import { Customer } from "@app/decorators"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { ImageSize } from "@modules/Image/image.types.d"
import { ImageService } from "@modules/Image/services/image.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PhysicalProductDamageType, Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"

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
          productVariant: {
            select: {
              id: true,
            },
          },
          customer: {
            select: {
              id: true,
              reservations: {
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                  products: {
                    select: {
                      id: true,
                    },
                  },
                  newProducts: {
                    select: {
                      id: true,
                      productVariant: {
                        select: {
                          id: true,
                        },
                      },
                    },
                  },
                  sentPackage: {
                    select: {
                      items: {
                        select: {
                          id: true,
                        },
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
    bagItemLoader
  ) {
    const currentBagItem = await bagItemLoader.load(parent.id)
    const reservationStatus = currentBagItem?.customer?.reservations[0]?.status
    const isQueueOrHold = ["Queued", "Hold"].includes(reservationStatus)
    const isReserved = currentBagItem.status === "Reserved"
    const newProductVariantIDs = await currentBagItem?.customer?.reservations[0]?.newProducts?.reduce(
      (a, b) => {
        a.push(b?.productVariant?.id)
        return a
      },
      []
    )
    const isNewProduct = newProductVariantIDs?.includes(
      currentBagItem?.productVariant?.id
    )
    const isSwappable = isQueueOrHold && isReserved && isNewProduct

    return isSwappable
  }
}
