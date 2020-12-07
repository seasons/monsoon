import { Customer, User } from "@app/decorators"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { PhysicalProduct, PhysicalProductSellable } from "@app/prisma"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { head } from "lodash"

@Resolver("ProductVariant")
export class ProductVariantFieldsResolver {
  constructor(private readonly prisma: PrismaService) {}

  @ResolveField()
  async isInBag(@Parent() parent, @Customer() customer) {
    if (!customer) return false

    const bagItems = await this.prisma.client.bagItems({
      where: {
        productVariant: {
          id: parent.id,
        },
        customer: {
          id: customer.id,
        },
        saved: false,
      },
    })

    return bagItems.length > 0
  }

  @ResolveField()
  async isSaved(@Parent() parent, @Customer() customer) {
    if (!customer) return false

    const bagItems = await this.prisma.client.bagItems({
      where: {
        productVariant: {
          id: parent.id,
        },
        customer: {
          id: customer.id,
        },
        saved: true,
      },
    })

    return bagItems.length > 0
  }

  @ResolveField()
  async hasRestockNotification(@Parent() parent, @Customer() customer) {
    if (!customer) return false

    const restockNotifications = await this.prisma.client.productNotifications({
      where: {
        customer: {
          id: customer.id,
        },
        AND: {
          productVariant: {
            id: parent.id,
          },
        },
      },
      orderBy: "createdAt_DESC",
    })

    const firstNotification = head(restockNotifications)
    const hasRestockNotification =
      firstNotification && firstNotification?.shouldNotify === true

    return !!hasRestockNotification
  }

  @ResolveField()
  async isWanted(@Parent() parent, @User() user) {
    if (!user) return false

    const productVariant = await this.prisma.client.productVariant({
      id: parent.id,
    })
    if (!productVariant) {
      return false
    }

    const productVariantWants = await this.prisma.client.productVariantWants({
      where: {
        user: {
          id: user.id,
        },
        AND: {
          productVariant: {
            id: productVariant.id,
          },
        },
      },
    })

    const exists = productVariantWants && productVariantWants.length > 0
    return exists
  }

  @ResolveField()
  async size(@Parent() parent) {
    const productVariant = await this.prisma.binding.query.productVariant(
      {
        where: {
          id: parent.id,
        },
      },
      `
    {
      id
      internalSize {
        top {
          letter
        }
        bottom {
          id
          type
          value
        }
        display
        productType
      }
    }
    `
    )
    return productVariant?.internalSize?.display
  }

  @ResolveField()
  async sellable(
    @Parent() productVariant,
    @Loader({
      params: {
        query: "physicalProducts",
        formatWhere: ids => ({
          productVariant: {
            id_in: ids,
          },
        }),
        getKeys: a => [a?.productVariant?.id],
        info: `{
            productVariant {
              id
            }
            sellable {
              new
              newPrice
              used
              usedPrice
            }
          }
        `,
        keyToDataRelationship: "OneToMany",
        fallbackValue: null,
      },
    })
    physicalProductsLoader: PrismaDataLoader<
      Array<PhysicalProduct & { sellable: PhysicalProductSellable }>
    >
  ) {
    const physicalProducts =
      (await physicalProductsLoader.load(productVariant.id)) || []

    const maxComparator = key => (a, b) => {
      const aValue = a?.sellable?.[key] || Number.MIN_VALUE
      const bValue = b?.sellable?.[key] || Number.MIN_VALUE

      return bValue - aValue
    }

    const newPhysicalProduct = [...physicalProducts]
      .sort(maxComparator("newPrice"))
      .shift()
    const usedPhysicalProduct = [...physicalProducts]
      .sort(maxComparator("usedPrice"))
      .shift()
    return {
      id:
        newPhysicalProduct && usedPhysicalProduct
          ? `${newPhysicalProduct.id}-${usedPhysicalProduct.id}`
          : productVariant.id,
      new: physicalProducts.some(p => p?.sellable?.new),
      newPrice: newPhysicalProduct?.sellable?.newPrice,
      used: physicalProducts.some(p => p?.sellable?.used),
      usedPrice: usedPhysicalProduct?.sellable?.usedPrice,
    }
  }
}
