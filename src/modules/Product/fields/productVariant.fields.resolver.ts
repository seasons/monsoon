import { Customer, User } from "@app/decorators"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ProductVariant } from "@app/prisma/prisma.binding"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { head } from "lodash"

@Resolver("ProductVariant")
export class ProductVariantFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

  @ResolveField()
  async display(
    @Parent() parent,
    @Loader({
      params: {
        query: "productVariants",
        info: `
        {
          id
          internalSize {
            id
            display
            top {
              id
              letter
            }
            bottom {
              id
              value
            }
          }
          manufacturerSizes {
            id
            display
            top {
              id
              letter
            }
            bottom {
              id
              type
              value
            }
          }
        }`,
      },
    })
    productVariantLoader: PrismaDataLoader<ProductVariant>
  ) {
    const variant = await productVariantLoader.load(parent.id)

    const shortToLongName = size => {
      switch (size) {
        case "XXS":
          return "XX-Small"
        case "XS":
          return "X-Small"
        case "S":
          return "Small"
        case "M":
          return "Medium"
        case "L":
          return "Large"
        case "XL":
          return "X-Large"
        case "XXL":
          return "XX-Large"
        default:
          return size
      }
    }

    const sizeConversion = this.utils.parseJSONFile(
      "src/modules/Product/sizeConversion"
    )

    let long = ""
    let short = ""

    const manufacturerSize = variant?.manufacturerSizes?.[0]
    const manufacturerSizeBottomType =
      variant?.manufacturerSizes?.[0]?.bottom?.type
    const internalSize = variant?.internalSize

    if (
      (!!manufacturerSize && manufacturerSizeBottomType === "EU") ||
      manufacturerSizeBottomType === "JP"
    ) {
      const manufacturerToUSBottomSize =
        sizeConversion.bottoms[manufacturerSize.bottom?.type][
          manufacturerSize?.bottom?.value
        ] || manufacturerSize?.bottom?.value
      long = manufacturerToUSBottomSize
      short = manufacturerToUSBottomSize
    } else if (!!manufacturerSize) {
      if (manufacturerSizeBottomType) {
        long = shortToLongName(manufacturerSize.bottom?.value)
        short = manufacturerSize.bottom?.value
      } else {
        long = shortToLongName(manufacturerSize.top?.letter)
        short = manufacturerSize.top?.letter
      }
    } else if (!!internalSize?.id) {
      if (internalSize?.bottom?.value) {
        long = shortToLongName(
          internalSize.bottom?.value || internalSize.display || ""
        )
        short = internalSize.display
      } else {
        const letter = internalSize.top?.letter || internalSize.display || ""
        long = shortToLongName(letter)
        short = letter
      }
    }

    return { long, short }
  }

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
}
