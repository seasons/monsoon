import { Injectable } from "@nestjs/common"
import {
  BagItem,
  BottomSizeType,
  Customer,
  ID_Input,
  LetterSize,
  Product,
  ProductFunction,
  ProductVariantCreateWithoutProductInput,
  RecentlyViewedProduct,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { head } from "lodash"

import { UtilsService } from "../../Utils/services/utils.service"
import { ProductUtilsService } from "./product.utils.service"
import { ProductVariantService } from "./productVariant.service"

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productUtils: ProductUtilsService,
    private readonly productVariantService: ProductVariantService,
    private readonly utils: UtilsService
  ) {}

  async getProducts(args, info) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    return await this.prisma.binding.query.products(
      { ...args, ...queryOptions },
      info
    )
  }

  async getProductsConnection(args, info) {
    const queryOptions = await this.productUtils.queryOptionsForProducts(args)
    return await this.prisma.binding.query.productsConnection(
      { ...args, ...queryOptions },
      info
    )
  }

  async addViewedProduct(item, customer) {
    const viewedProducts = await this.prisma.client.recentlyViewedProducts({
      where: {
        customer: { id: customer.id },
        product: { id: item },
      },
    })
    const viewedProduct: RecentlyViewedProduct = head(viewedProducts)

    if (viewedProduct) {
      return await this.prisma.client.updateRecentlyViewedProduct({
        where: {
          id: viewedProduct.id,
        },
        data: {
          viewCount: viewedProduct.viewCount++,
        },
      })
    } else {
      return await this.prisma.client.createRecentlyViewedProduct({
        customer: {
          connect: {
            id: customer.id,
          },
        },
        product: {
          connect: {
            id: item,
          },
        },
        viewCount: 1,
      })
    }
  }

  async isSaved(
    product: { id: ID_Input } | Product,
    customer: { id: ID_Input } | Customer | null
  ) {
    if (!customer) {
      return false
    }
    const productVariants = await this.prisma.client.productVariants({
      where: {
        product: {
          id: product.id,
        },
      },
    })

    const bagItem = await this.prisma.client.bagItems({
      where: {
        customer: {
          id: customer.id,
        },
        productVariant: {
          id_in: productVariants.map(a => a.id),
        },
        saved: true,
      },
    })

    return bagItem.length > 0
  }

  async createProduct(input) {
    const {
      name,
      brandID,
      categoryID,
      type,
      description,
      modelID,
      retailPrice,
      modelSizeID,
      colorID,
      secondaryColorID,
      tags,
      functions,
      innerMaterials,
      outerMaterials,
      status,
      season,
      architecture,
      variants,
    } = input
    const brand = await this.prisma.client.brand({ id: brandID })
    const color = await this.prisma.client.color({ id: colorID })
    const model = await this.prisma.client.productModel({ id: modelID })
    const productFunctions = await Promise.all(
      functions.map(
        async functionName =>
          await this.prisma.client.upsertProductFunction({
            create: { name: functionName },
            update: { name: functionName },
            where: { name: functionName },
          })
      )
    )
    const functionIDs = productFunctions
      .filter(Boolean)
      .map((func: ProductFunction) => ({ id: func.id }))
    const slug = await this.productUtils.getProductSlug(
      brand.brandCode,
      name,
      color.name
    )
    const variantsCreateInput: ProductVariantCreateWithoutProductInput[] = await Promise.all(
      variants.map(async variant => {
        const {
          sku,
          internalSizeName,
          weight,
          total,
          physicalProducts,
          sleeve,
          shoulder,
          chest,
          neck,
          length,
          bottomSizeType,
          waist,
          rise,
          hem,
          inseam,
        } = variant
        const internalSize = await this.productUtils.deepUpsertSize({
          slug: `${sku}-internal`,
          type,
          display: internalSizeName,
          topSizeData: type === "Top" && {
            letter: (internalSizeName as LetterSize) || null,
            sleeve,
            shoulder,
            chest,
            neck,
            length,
          },
          bottomSizeData: type === "Bottom" && {
            type: (bottomSizeType as BottomSizeType) || null,
            value: internalSizeName || "",
            waist,
            rise,
            hem,
            inseam,
          },
        })
        const physicalProductsCreateInput = physicalProducts.map(
          physicalProduct => {
            const {
              seasonsUID,
              inventoryStatus,
              physicalProductStatus,
            } = physicalProduct
            return {
              seasonsUID,
              inventoryStatus,
              physicalProductStatus,
            }
          }
        )
        return {
          sku,
          color: {
            connect: { id: colorID },
          },
          internalSize: {
            connect: { id: internalSize.id },
          },
          weight,
          productID: slug,
          retailPrice,
          total,
          reservable: status === "Available" ? total : 0,
          reserved: 0,
          nonReservable: status === "NotAvailable" ? total : 0,
          physicalProducts: {
            create: physicalProductsCreateInput,
          },
        }
      })
    )
    const product = await this.prisma.client.createProduct({
      slug,
      name,
      brand: {
        connect: { id: brandID },
      },
      category: {
        connect: { id: categoryID },
      },
      type,
      description,
      modelHeight: model.height,
      retailPrice,
      model: {
        connect: { id: model.id },
      },
      modelSize: {
        connect: { id: modelSizeID },
      },
      color: {
        connect: { id: colorID },
      },
      secondaryColor: {
        connect: { id: secondaryColorID },
      },
      tags: {
        set: tags,
      },
      functions: {
        connect: functionIDs,
      },
      innerMaterials: { set: innerMaterials },
      outerMaterials: { set: outerMaterials },
      status,
      season,
      architecture,
      variants: {
        create: variantsCreateInput,
      },
    })
    return product
  }

  async saveProduct(item, save, info, customer) {
    const bagItems = await this.prisma.binding.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          productVariant: {
            id: item,
          },
          saved: true,
        },
      },
      info
    )
    let bagItem: BagItem = head(bagItems)

    if (bagItem && !save) {
      await this.prisma.client.deleteBagItem({
        id: bagItem.id,
      })
    } else if (!bagItem && save) {
      bagItem = await this.prisma.client.createBagItem({
        customer: {
          connect: {
            id: customer.id,
          },
        },
        productVariant: {
          connect: {
            id: item,
          },
        },
        position: 0,
        saved: save,
        status: "Added",
      })
    }

    if (save) {
      return this.prisma.binding.query.bagItem(
        {
          where: {
            id: bagItem.id,
          },
        },
        info
      )
    }

    return bagItem ? bagItem : null
  }

  async checkItemsAvailability(items, customer) {
    const reservedBagItems = await this.prisma.binding.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          productVariant: {
            id_in: items,
          },
          status_not: "Added",
        },
      },
      `{
        productVariant {
          id
        }
      }`
    )

    const reservedIds = reservedBagItems.map(a => a.productVariant.id)
    const newItems = items.filter(a => !reservedIds.includes(a))

    await this.productVariantService.updateProductVariantCounts(newItems, {
      dryRun: true,
    })

    return true
  }

  async getGeneratedVariantSKUs({ input }) {
    const { brandID, colorID, sizeNames } = input
    const brand = await this.prisma.client.brand({ id: brandID })
    const color = await this.prisma.client.color({ id: colorID })

    if (!brand || !color) {
      return null
    }

    const brandCount = await this.prisma.client
      .productsConnection({
        where: { brand: { id: brandID } },
      })
      .aggregate()
      .count()
    if (brandCount === null) {
      return null
    }

    const styleNumber = brandCount + 1
    const styleCode = styleNumber.toString().padStart(3, "0")
    return sizeNames.map(sizeName => {
      const sizeCode = this.utils.sizeNameToSizeCode(sizeName)
      return `${brand.brandCode}-${color.colorCode}-${sizeCode}-${styleCode}`
    })
  }
}
