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
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import {
  PrismaTwoDataLoader,
  PrismaTwoLoader,
} from "@app/prisma/prisma2.loader"
import { Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import {
  BagItem,
  PhysicalProduct,
  PhysicalProductPrice,
  Prisma,
  Product,
  ProductNotification,
} from "@prisma/client"
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
        formatWhere: ids => ({
          AND: [{ customer: { id: { in: ids } } }, { status: "Submitted" }],
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
      const physicalProducts = await physicalProductsLoader.loadMany(
        physicalProductIDs
      )

      const productVariantIDs = physicalProducts?.map(p => p.productVariant.id)
      return productVariantIDs.includes(productVariant.id)
    } else {
      return false
    }
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
        }),
        formatWhere: (ids, ctx) =>
          Prisma.validator<Prisma.BagItemWhereInput>()({
            productVariant: {
              id: { in: ids },
            },
            customer: {
              id: ctx.customer?.id,
            },
            saved: false,
          }),
      },
    })
    bagItemloader: PrismaTwoDataLoader
  ) {
    if (!customer) return false

    const bagItems = await bagItemloader.load(parent.id)

    return bagItems.length > 0
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
      },
    })
    bagItemloader: PrismaTwoDataLoader
  ) {
    if (!customer) return false

    const bagItems = await bagItemloader.load(parent.id)

    return bagItems.length > 0
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
        }),
        formatWhere: (ids, ctx) =>
          Prisma.validator<Prisma.ProductNotificationWhereInput>()({
            customer: {
              id: ctx.customer.id,
            },
            AND: {
              productVariant: {
                id: { in: ids },
              },
            },
          }),
        orderBy: Prisma.validator<Prisma.ProductNotificationOrderByInput>()({
          createdAt: "desc",
        }),
      },
    })
    productNotificationsLoader: PrismaTwoDataLoader
  ) {
    if (!customer) return false

    const restockNotifications = (await productNotificationsLoader.load(
      parent.id
    )) as ProductNotification[]

    const firstNotification = head(restockNotifications)
    const hasRestockNotification =
      firstNotification && firstNotification?.shouldNotify === true

    return !!hasRestockNotification
  }

  @ResolveField()
  async isWanted(
    @Parent() parent,
    @User() user,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "ProductVariantWant",
        select: { id: true },
        formatWhere: (ids, ctx) =>
          Prisma.validator<Prisma.ProductVariantWantWhereInput>()({
            user: {
              id: ctx.user.id,
            },
            AND: {
              productVariant: {
                id: { in: ids },
              },
            },
          }),
      },
    })
    wantsLoader
  ) {
    if (!user) return false

    const productVariantWants = await wantsLoader.load(parent.id)

    const exists = productVariantWants && productVariantWants.length > 0
    return exists
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
    productVariantLoader: PrismaDataLoader<ProductVariant>
  ) {
    const productVariant = await productVariantLoader.load(parent.id)
    return productVariant?.internalSize?.display
  }

  // TODO:
  @ResolveField()
  async nextReservablePhysicalProduct(
    @Parent() parent,
    @Info() info,
    @Loader({
      params: {
        query: "physicalProducts",
        formatWhere: keys => ({
          AND: [
            { inventoryStatus: "Reservable" },
            { productVariant: { id_in: keys } },
          ],
        }),
        info: `{
          id 
          productVariant {
            id
          }
          reports(orderBy: createdAt_DESC, first: 1) {
            score
          }
        }`,
        keyToDataRelationship: "OneToMany",
        getKeys: a => [a?.productVariant?.id],
        fallbackValue: [],
      },
    })
    physicalProductsLoader: PrismaDataLoader<
      Array<{
        id: string
        productVariant: { id: string }
        reports?: Array<{ score?: number }>
      }>
    >,
    @Loader({
      params: {
        query: "physicalProducts",
      },
      includeInfo: true,
    })
    physicalProductInfoLoader: PrismaDataLoader<PhysicalProduct>
  ) {
    const physicalProducts = await physicalProductsLoader.load(parent.id)

    const qualityReportByPhysicalProductId = physicalProducts.reduce(
      (memo, physicalProduct, idx) => {
        return {
          ...memo,
          ...(physicalProduct.reports && physicalProduct.reports.length > 0
            ? { [physicalProducts[idx].id]: physicalProduct.reports[0] }
            : {}),
        }
      },
      {}
    )

    physicalProducts.sort((a, b) => {
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

    if (physicalProducts.length === 0) {
      return null
    }

    return physicalProductInfoLoader.load(physicalProducts[0].id)
  }

  @ResolveField()
  async price(
    @Parent() productVariant: Pick<ProductVariant, "id">,
    @Customer() customer,
    @Loader({
      type: PrismaTwoLoader.name,
      params: {
        model: "Customer",
        select: Prisma.validator<Prisma.CustomerSelect>()({
          id: true,
          bagItems: {
            select: {
              id: true,
              status: true,
              productVariant: { select: { id: true } },
            },
          },
        }),
      },
    })
    customerLoader: PrismaTwoDataLoader<{
      bagItems: Array<
        Pick<BagItem, "status"> & {
          productVariant: Pick<ProductVariant, "id">
        }
      >
    }>,
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
    productVariantLoader: PrismaDataLoader<{
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
      } = await (product?.brand?.shopifyShop?.enabled
        ? Date.parse(shopifyProductVariant?.cacheExpiresAt) > Date.now()
          ? Promise.resolve(shopifyProductVariant)
          : this.shopify.cacheProductVariantBuyMetadata({
              shopifyProductVariantExternalId: shopifyProductVariant.externalId,
              shopifyProductVariantInternalId: shopifyProductVariant.id,
              shopName: product?.brand?.shopifyShop?.shopName,
              accessToken: product?.brand?.shopifyShop?.accessToken,
            })
        : Promise.resolve({ cachedAvailableForSale: false, cachedPrice: null }))
      shopifyCacheData = {
        buyNewAvailableForSale,
        buyNewPrice,
      }
    } catch (e) {
      this.error.captureError(e)
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
