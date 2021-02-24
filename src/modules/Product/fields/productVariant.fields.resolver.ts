import { Customer, User } from "@app/decorators"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { ShopifyService } from "@app/modules/Shopify/services/shopify.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import {
  BagItem,
  ExternalShopifyIntegration,
  InventoryStatus,
  PhysicalProductPrice,
  Product,
  ShopifyProductVariant,
} from "@app/prisma"
import { Order, ProductVariant } from "@app/prisma/prisma.binding"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { head } from "lodash"

type EUSize = "44" | "46" | "48" | "50" | "52" | "54" | "56"
type JPSize = "0" | "1" | "2" | "3" | "4"

interface SizeConversion {
  tops: { JP: JPSize; EU: EUSize }
  bottoms: { JP: JPSize; EU: EUSize }
}

@Resolver("ProductVariant")
export class ProductVariantFieldsResolver {
  sizeConversion: SizeConversion
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private readonly shopify: ShopifyService
  ) {
    this.sizeConversion = this.utils.parseJSONFile(
      "src/modules/Product/sizeConversion"
    )
  }

  @ResolveField()
  async purchased(
    @Parent() productVariant: ProductVariant,
    @Customer() customer,
    @Loader({
      params: {
        query: "orders",
        info: `{
          id
          customer {
            id
          }
          lineItems {
              id
              recordType
              recordID
          }
        }`,
        formatWhere: ids => ({ customer: { id_in: ids } }),
        getKeys: a => [a.customer.id],
        fallbackValue: null,
        keyToDataRelationship: "OneToMany",
      },
    })
    ordersLoader: PrismaDataLoader<Order[]>
  ) {
    if (!customer?.id) {
      return false
    }

    const orders = await ordersLoader.load(customer.id)
    const physicalProductIDs = []

    const inOrders = orders?.some(order => {
      return order?.lineItems?.some(item => {
        if (
          item.recordType === "ProductVariant" &&
          item.recordID === productVariant.id
        ) {
          return true
        } else if (item.recordType === "PhysicalProduct") {
          physicalProductIDs.push(item.recordID)
        }
      })
    })

    if (inOrders) {
      return true
    }

    if (physicalProductIDs.length > 0) {
      const physicalProducts = await this.prisma.binding.query.physicalProducts(
        {
          where: { id_in: physicalProductIDs },
        },
        `
        {
          id
          productVariant {
            id
          }
        }
        `
      )

      const physicalProductIDS = physicalProducts?.map(p => p.productVariant.id)
      return physicalProductIDS.includes(productVariant.id)
    } else {
      return false
    }
  }

  @ResolveField()
  async displayLong(
    @Parent() parent,
    @Loader({
      params: {
        query: "productVariants",
        info: `
        {
          id
          internalSize {
            id
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

    // If top exit early because we are only using internalSizes for tops
    const internalSize = variant?.internalSize
    if (!!internalSize.top) {
      return shortToLongName(internalSize.top.letter)
    }

    const manufacturerSize = variant?.manufacturerSizes?.[0]
    if (!!manufacturerSize) {
      if (
        manufacturerSize?.bottom?.type === "JP" ||
        manufacturerSize?.bottom?.type === "EU"
      ) {
        const sizeConversion = this.utils.parseJSONFile(
          "src/modules/Product/sizeConversion"
        )
        const conversion =
          sizeConversion.bottoms?.[manufacturerSize.bottom.type][
            manufacturerSize.bottom.value
          ]

        return shortToLongName(conversion)
      } else {
        return shortToLongName(manufacturerSize?.bottom?.value)
      }
    } else {
      return shortToLongName(internalSize.bottom?.value)
    }
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

  @ResolveField()
  async price(
    @Parent() productVariant: Pick<ProductVariant, "id">,
    @Customer() customer,
    @Loader({
      params: {
        query: "customers",
        info: `{
          bagItems {
            status
            productVariant {
              id
            }
          }
        }`,
      },
    })
    customerLoader: PrismaDataLoader<{
      bagItems: Array<
        Pick<BagItem, "status"> & { productVariant: Pick<ProductVariant, "id"> }
      >
    }>,
    @Loader({
      params: {
        query: "productVariants",
        info: `{ 
          id
          physicalProducts {
            price {
              buyUsedPrice
              buyUsedEnabled
            }
            inventoryStatus
          }
          product {
            buyNewEnabled
            brand {
              externalShopifyIntegration {
                enabled
                shopName
                accessToken
              }
            }
          }
          shopifyProductVariant {
            id
            cacheExpiresAt
            cachedAvailableForSale
            cachedPrice
            externalId
          }
        }`,
      },
    })
    productVariantLoader: PrismaDataLoader<{
      physicalProducts: Array<{
        price: Pick<PhysicalProductPrice, "buyUsedPrice" | "buyUsedEnabled">
        inventoryStatus: InventoryStatus
      }>
      product: Pick<Product, "buyNewEnabled"> & {
        brand: {
          externalShopifyIntegration?: Pick<
            ExternalShopifyIntegration,
            "enabled" | "shopName" | "accessToken"
          >
        }
      }
      shopifyProductVariant: Pick<
        ShopifyProductVariant,
        | "cacheExpiresAt"
        | "cachedAvailableForSale"
        | "cachedPrice"
        | "id"
        | "externalId"
      >
    }>
  ) {
    const [productVariantResult, customerResult] = await Promise.all([
      productVariantLoader.load(productVariant.id),
      customer ? customerLoader.load(customer.id) : Promise.resolve(null),
    ])
    const {
      physicalProducts,
      product,
      shopifyProductVariant,
    } = productVariantResult

    const usedPhysicalProduct = [...physicalProducts]
      .sort((a, b) => {
        const aValue = a?.price?.buyUsedPrice || Number.MIN_VALUE
        const bValue = b?.price?.buyUsedPrice || Number.MIN_VALUE

        return bValue - aValue
      })
      .shift()

    /**
     * If external shopify integration is enabled, use the cached shopify
     * product variant if it is valid, otherwise re-fetch from shopify and
     * persist the updated cache. Noop if shopify integration is disabled
     * for the brand.
     */
    let shopifyCacheData = {}
    try {
      const {
        cachedAvailableForSale: buyNewAvailableForSale,
        cachedPrice: buyNewPrice,
      } = await (product?.brand?.externalShopifyIntegration?.enabled
        ? Date.parse(shopifyProductVariant?.cacheExpiresAt) > Date.now()
          ? Promise.resolve(shopifyProductVariant)
          : this.shopify.cacheProductVariant({
              shopifyProductVariantExternalId: shopifyProductVariant.externalId,
              shopifyProductVariantInternalId: shopifyProductVariant.id,
              shopName: product?.brand?.externalShopifyIntegration?.shopName,
              accessToken:
                product?.brand?.externalShopifyIntegration?.accessToken,
            })
        : Promise.resolve({ cachedAvailableForSale: false, cachedPrice: null }))
      shopifyCacheData = {
        buyNewAvailableForSale,
        buyNewPrice,
      }
    } catch (e) {
      shopifyCacheData = {
        buyNewAvailableForSale: false,
        buyNewPrice: null,
      }
    }

    const isProductVariantReserved = (customerResult?.bagItems || []).some(
      ({ status, productVariant: { id: productVariantId } }) =>
        status === "Reserved" && productVariantId === productVariant.id
    )
    const buyUsedEnabled = physicalProducts.some(p => p?.price?.buyUsedEnabled)
    const buyUsedAvailableForSale = physicalProducts.some(
      physicalProduct =>
        physicalProduct.price &&
        physicalProduct.price.buyUsedEnabled &&
        ((physicalProduct.inventoryStatus === "Reserved" &&
          isProductVariantReserved) ||
          physicalProduct.inventoryStatus === "Reservable" ||
          physicalProduct.inventoryStatus === "Stored")
    )

    return {
      id: productVariant.id,
      buyUsedEnabled,
      buyUsedAvailableForSale,
      buyUsedPrice: usedPhysicalProduct?.price?.buyUsedPrice,
      buyNewEnabled: product.buyNewEnabled,
      ...shopifyCacheData,
    }
  }
}
