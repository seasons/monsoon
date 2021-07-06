import { Customer, User } from "@app/decorators"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { ShopifyService } from "@app/modules/Shopify/services/shopify.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import {
  InventoryStatus,
  ShopifyProductVariant,
  ShopifyShop,
} from "@app/prisma"
import { Order, ProductVariant } from "@app/prisma/prisma.binding"
import {
  PrismaTwoDataLoader,
  PrismaTwoLoader,
} from "@app/prisma/prisma2.loader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import {
  BagItem,
  PhysicalProduct,
  PhysicalProductPrice,
  Prisma,
  Product,
  ProductNotification,
} from "@prisma/client"
import { head, orderBy } from "lodash"

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
    private readonly utils: UtilsService,
    private readonly error: ErrorService,
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
      type: PrismaTwoLoader.name,
      params: {
        model: "Order",
        select: Prisma.validator<Prisma.OrderSelect>()({
          id: true,
          status: true,
          customer: { select: { id: true } },
          lineItems: { select: { id: true, recordType: true, recordID: true } },
        }),
        formatWhere: ids =>
          Prisma.validator<Prisma.OrderWhereInput>()({
            AND: [
              { customer: { id: { in: ids } } },
              { status: { in: ["Submitted", "Fulfilled"] } },
            ],
          }),
        getKeys: a => [a.customer.id],
        fallbackValue: null,
        keyToDataRelationship: "OneToMany",
      },
    })
    ordersLoader: PrismaTwoDataLoader<Order[]>,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "PhysicalProduct",
        select: Prisma.validator<Prisma.PhysicalProductSelect>()({
          id: true,
          productVariant: { select: { id: true } },
        }),
      },
    })
    physicalProductsLoader: PrismaTwoDataLoader
  ) {
    if (!customer?.id) {
      return false
    }

    const orders = await ordersLoader.load(customer.id)
    const inOrders = orders?.some(order => {
      return order?.lineItems?.some(
        item =>
          item.recordType === "ProductVariant" &&
          item.recordID === productVariant.id
      )
    })

    if (inOrders) {
      return true
    }

    const physicalProductIDs =
      orders
        ?.flatMap(a => a.lineItems)
        ?.filter(a => a.recordType === "PhysicalProduct")
        ?.map(a => a.recordID) || []

    if (physicalProductIDs.length > 0) {
      const physicalProducts = await physicalProductsLoader.loadMany(
        physicalProductIDs
      )

      const productVariantIDs = physicalProducts?.map(p => p.productVariant.id)
      return productVariantIDs.includes(productVariant.id)
    }

    return false
  }

  @ResolveField()
  async displayLong(
    @Parent() parent,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "ProductVariant",
        select: Prisma.validator<Prisma.ProductVariantSelect>()({
          id: true,
          displayShort: true,
          internalSize: { select: { id: true, type: true, display: true } },
          manufacturerSizes: {
            select: { id: true, type: true, display: true },
          },
        }),
      },
    })
    productVariantLoader: PrismaTwoDataLoader<ProductVariant>
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

    let displayLong
    const manufacturerSize = head(variant.manufacturerSizes)
    switch (manufacturerSize.type) {
      case "EU":
      case "JP":
      case "US":
      case "Letter":
        displayLong = shortToLongName(variant.displayShort)
        break
      case "WxL":
        displayLong = manufacturerSize.display // e.g if displayShort is 30, displayLong should be 30x42.
        break
      default:
        // Cases such as "Universal", should be the same
        displayLong = variant.displayShort
        break
    }

    return displayLong
  }

  @ResolveField()
  async isInBag(
    @Parent() parent,
    @Customer() customer,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "BagItem",
        select: Prisma.validator<Prisma.BagItemSelect>()({
          id: true,
          productVariant: { select: { id: true } },
        }),
        formatWhere: (ids, ctx) =>
          Prisma.validator<Prisma.BagItemWhereInput>()({
            productVariant: {
              id: { in: ids },
            },
            customer: {
              id: ctx.customer.id,
            },
            saved: false,
          }),
        getKeys: a => [a.productVariant.id],
        fallbackValue: null,
      },
    })
    bagItemloader: PrismaTwoDataLoader
  ) {
    if (!customer) return false

    const bagItem = await bagItemloader.load(parent.id)

    return !!bagItem
  }

  @ResolveField()
  async isSaved(
    @Parent() parent,
    @Customer() customer,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "BagItem",
        select: Prisma.validator<Prisma.BagItemSelect>()({
          id: true,
          productVariant: { select: { id: true } },
        }),
        formatWhere: (ids, ctx) =>
          Prisma.validator<Prisma.BagItemWhereInput>()({
            productVariant: {
              id: { in: ids },
            },
            customer: {
              id: ctx.customer?.id,
            },
            saved: true,
          }),
        fallbackValue: null,
        getKeys: bagItem => [bagItem.productVariant.id],
      },
    })
    bagItemloader: PrismaTwoDataLoader
  ) {
    if (!customer) return false

    const bagItem = await bagItemloader.load(parent.id)

    return !!bagItem
  }

  @ResolveField()
  async hasRestockNotification(
    @Parent() parent,
    @Customer() customer,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "ProductNotification",
        select: Prisma.validator<Prisma.ProductNotificationSelect>()({
          id: true,
          productVariant: { select: { id: true } },
          shouldNotify: true,
        }),
        formatWhere: (ids, ctx) =>
          Prisma.validator<Prisma.ProductNotificationWhereInput>()({
            customer: {
              id: ctx.customer.id,
            },
            productVariant: {
              id: { in: ids },
            },
          }),
        orderBy: Prisma.validator<Prisma.ProductNotificationOrderByInput>()({
          createdAt: "desc",
        }),
        getKeys: notification => [notification.productVariant.id],
        keyToDataRelationship: "OneToMany",
      },
    })
    productNotificationsLoader: PrismaTwoDataLoader<ProductNotification[]>
  ) {
    if (!customer) return false

    const restockNotifications = await productNotificationsLoader.load(
      parent.id
    )

    const latestNotification = head(restockNotifications)
    return !!latestNotification?.shouldNotify
  }

  @ResolveField()
  async isWanted(
    @Parent() parent,
    @User() user,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "ProductVariantWant",
        select: Prisma.validator<Prisma.ProductVariantWantSelect>()({
          id: true,
          productVariant: { select: { id: true } },
        }),
        formatWhere: (ids, ctx) =>
          Prisma.validator<Prisma.ProductVariantWantWhereInput>()({
            user: {
              id: ctx.req.user.id,
            },
            productVariant: {
              id: { in: ids },
            },
          }),
        getKeys: want => [want.productVariant.id],
        fallbackValue: null,
      },
    })
    wantsLoader
  ) {
    if (!user) return false

    const productVariantWant = await wantsLoader.load(parent.id)

    return !!productVariantWant
  }

  @ResolveField()
  async size(
    @Parent() parent,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "ProductVariant",
        select: Prisma.validator<Prisma.ProductVariantSelect>()({
          id: true,
          internalSize: { select: { id: true, display: true } },
        }),
      },
    })
    productVariantLoader: PrismaTwoDataLoader<ProductVariant>
  ) {
    const productVariant = await productVariantLoader.load(parent.id)
    return productVariant?.internalSize?.display
  }

  @ResolveField()
  async nextReservablePhysicalProduct(
    @Parent() parent,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "PhysicalProduct",
        formatWhere: keys => ({
          AND: [
            { inventoryStatus: "Reservable" },
            { productVariant: { every: { id: { in: keys } } } },
          ],
        }),
        select: Prisma.validator<Prisma.PhysicalProductSelect>()({
          id: true,
          productVariant: { select: { id: true } },
          reports: { select: { score: true, createdAt: true } },
        }),
        keyToDataRelationship: "OneToMany",
        getKeys: a => [a.productVariant.id],
      },
    })
    physicalProductsLoader: PrismaTwoDataLoader<
      Array<{
        id: string
        productVariant: { id: string }
        reports?: Array<{ score?: number; createdAt: Date }>
      }>
    >,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "PhysicalProduct",
        infoFragment: `fragment EnsureID on PhysicalProduct {
          id
        }`,
      },
      includeInfo: true,
    })
    physicalProductInfoLoader: PrismaTwoDataLoader<PhysicalProduct>
  ) {
    const reservablePhysicalProducts = await physicalProductsLoader.load(
      parent.id
    )

    if (reservablePhysicalProducts.length === 0) {
      return null
    }

    const qualityReportByPhysicalProductId = reservablePhysicalProducts.reduce(
      (acc, physicalProduct) => {
        const newAcc = { ...acc }
        if (physicalProduct.reports?.length > 0) {
          const latestReport = orderBy(
            physicalProduct.reports,
            a => new Date(a.createdAt),
            ["desc"]
          )?.[0]
          newAcc[physicalProduct.id] = latestReport
        }
        return newAcc
      },
      {}
    )

    reservablePhysicalProducts.sort((a, b) => {
      const aQualityReport = qualityReportByPhysicalProductId[a.id]
      const bQualityReport = qualityReportByPhysicalProductId[b.id]

      // sort physical product without a quality report more highly
      if (!bQualityReport && !aQualityReport) {
        return 0
      }
      if (bQualityReport && !aQualityReport) {
        return -1
      }
      if (aQualityReport && !bQualityReport) {
        return 1
      }

      // sort physical product according to quality score
      return (bQualityReport.score || 0) - (aQualityReport.score || 0)
    })

    return physicalProductInfoLoader.load(reservablePhysicalProducts[0].id)
  }

  @ResolveField()
  async price(
    @Parent() productVariant: Pick<ProductVariant, "id">,
    @Customer() customer,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "BagItem",
        select: Prisma.validator<Prisma.BagItemSelect>()({
          id: true,
          productVariant: { select: { id: true } },
        }),
        formatWhere: (keys, ctx) =>
          Prisma.validator<Prisma.BagItemWhereInput>()({
            productVariant: { id: { in: keys } },
            customer: { id: ctx.customer.id },
            status: "Reserved",
          }),
        getKeys: a => [a.productVariant.id],
        fallbackValue: null,
      },
    })
    reservedBagItemLoader: PrismaTwoDataLoader<
      Pick<BagItem, "id"> & { productVariant: Pick<ProductVariant, "id"> }[]
    >,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "ProductVariant",
        select: Prisma.validator<Prisma.ProductVariantSelect>()({
          id: true,
          physicalProducts: {
            select: {
              id: true,
              inventoryStatus: true,
              price: {
                select: { id: true, buyUsedPrice: true, buyUsedEnabled: true },
              },
            },
          },
          product: {
            select: {
              id: true,
              buyNewEnabled: true,
              brand: {
                select: {
                  id: true,
                  shopifyShop: {
                    select: {
                      enabled: true,
                      shopName: true,
                      accessToken: true,
                    },
                  },
                },
              },
            },
          },
          shopifyProductVariant: {
            select: {
              id: true,
              cacheExpiresAt: true,
              cachedAvailableForSale: true,
              cachedPrice: true,
              externalId: true,
            },
          },
        }),
      },
    })
    productVariantLoader: PrismaTwoDataLoader<{
      physicalProducts: Array<{
        price: Pick<PhysicalProductPrice, "buyUsedPrice" | "buyUsedEnabled">
        inventoryStatus: InventoryStatus
      }>
      product: Pick<Product, "buyNewEnabled"> & {
        brand: {
          shopifyShop?: Pick<
            ShopifyShop,
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
    const productVariantResult = await productVariantLoader.load(
      productVariant.id
    )
    const {
      physicalProducts,
      product,
      shopifyProductVariant,
    } = productVariantResult

    /**
     * BUY NEW PRICE
     *
     * If external shopify integration is enabled, use the cached shopify
     * product variant if it is valid, otherwise re-fetch from shopify and
     * persist the updated cache. Noop if shopify integration is disabled
     * for the brand.
     */
    let buyNewPrice = {
      buyNewAvailableForSale: false,
      buyNewPrice: null,
      buyNewEnabled: product.buyNewEnabled,
    }
    try {
      let result
      if (product?.brand?.shopifyShop?.enabled) {
        const cacheExpired =
          Date.parse(shopifyProductVariant?.cacheExpiresAt) < Date.now()
        if (cacheExpired) {
          result = await this.shopify.cacheProductVariantBuyMetadata({
            shopifyProductVariantExternalId: shopifyProductVariant.externalId,
            shopifyProductVariantInternalId: shopifyProductVariant.id,
            shopName: product?.brand?.shopifyShop?.shopName,
            accessToken: product?.brand?.shopifyShop?.accessToken,
          })
        } else {
          result = shopifyProductVariant
        }
        buyNewPrice["buyNewAvailableForSale"] = result?.cachedAvailableForSale
        buyNewPrice["buyNewPrice"] = result?.cachedPrice
      }
    } catch (e) {
      this.error.captureError(e)
    }

    // BUY USED PRICE
    const buyUsedEnabled = physicalProducts.some(p => p?.price?.buyUsedEnabled)
    const buyUsedPrice = {
      buyUsedEnabled,
      buyUsedAvailableForSale: false,
      buyUsedPrice: 0,
    }
    if (buyUsedEnabled) {
      let reservedBagItem =
        !!customer && (await reservedBagItemLoader.load(productVariant.id))
      const isProductVariantReserved = !!reservedBagItem
      const mostExpensiveUsedPhysicalProduct = head(
        orderBy(physicalProducts, a => a.price?.buyUsedPrice || 0, "desc")
      )
      const buyUsedAvailableForSale = physicalProducts.some(
        physicalProduct =>
          !!physicalProduct.price?.buyUsedEnabled &&
          ((physicalProduct.inventoryStatus === "Reserved" &&
            isProductVariantReserved) ||
            physicalProduct.inventoryStatus === "Reservable" ||
            physicalProduct.inventoryStatus === "Stored")
      )

      buyUsedPrice.buyUsedAvailableForSale = buyUsedAvailableForSale
      buyUsedPrice.buyUsedPrice =
        mostExpensiveUsedPhysicalProduct?.price?.buyUsedPrice
    }

    return {
      id: productVariant.id,
      ...buyNewPrice,
      ...buyUsedPrice,
    }
  }
}
