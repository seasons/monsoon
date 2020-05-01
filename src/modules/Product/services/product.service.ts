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

import { ImageService } from "../../Image/services/image.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { ProductUtilsService } from "./product.utils.service"
import { ProductVariantService } from "./productVariant.service"

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService,
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

  async upsertProduct(input) {
    const brand = await this.prisma.client.brand({ id: input.brandID })
    const color = await this.prisma.client.color({ id: input.colorID })
    const model = await this.prisma.client.productModel({ id: input.modelID })
    const productFunctions = await Promise.all(
      input.functions.map(
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
      input.name,
      color.name
    )
    const imageURLs = await this.imageService.uploadImages(input.images)
    const productData = {
      slug,
      name,
      brand: {
        connect: { id: input.brandID },
      },
      category: {
        connect: { id: input.categoryID },
      },
      type: input.type,
      description: input.description,
      modelHeight: model.height,
      retailPrice: input.retailPrice,
      model: {
        connect: { id: model.id },
      },
      modelSize: {
        connect: { id: input.modelSizeID },
      },
      color: {
        connect: { id: input.colorID },
      },
      secondaryColor: {
        connect: { id: input.secondaryColorID },
      },
      tags: {
        set: input.tags,
      },
      functions: {
        connect: functionIDs,
      },
      innerMaterials: { set: input.innerMaterials },
      outerMaterials: { set: input.outerMaterials },
      status: input.status,
      season: input.season,
      architecture: input.architecture,
    }
    const productCreateData = {
      ...productData,
      variants: {
        create: input.variants.map(variant =>
          this.getVariantData(
            variant,
            "CREATE",
            input.type,
            input.colorID,
            input.slug,
            input.retailPrice
          )
        ),
      },
    }
    const productUpdateData = {
      ...productData,
      variants: {
        upsert: input.variants.map(variant => ({
          create: this.getVariantData(
            variant,
            "CREATE",
            input.type,
            input.colorID,
            input.slug,
            input.retailPrice
          ),
          update: this.getVariantData(
            variant,
            "UPDATE",
            input.type,
            input.colorID,
            input.slug,
            input.retailPrice
          ),
          where: { sku: variant.sku },
        })),
      },
    }
    const product = await this.prisma.client.upsertProduct({
      create: productCreateData,
      update: productUpdateData,
      where: { slug },
    })
    return product
  }

  async getVariantData(variant, operation, type, colorID, slug, retailPrice) {
    const internalSize = await this.productUtils.deepUpsertSize({
      slug: `${variant.sku}-internal`,
      type,
      display: variant.internalSizeName,
      topSizeData: type === "Top" && {
        letter: (variant.internalSizeName as LetterSize) || null,
        sleeve: variant.sleeve,
        shoulder: variant.shoulder,
        chest: variant.chest,
        neck: variant.neck,
        length: variant.length,
      },
      bottomSizeData: type === "Bottom" && {
        type: (variant.bottomSizeType as BottomSizeType) || null,
        value: variant.internalSizeName || "",
        waist: variant.waist,
        rise: variant.rise,
        hem: variant.hem,
        inseam: variant.inseam,
      },
    })

    let physicalProductsInput
    switch (operation) {
      case "CREATE":
        physicalProductsInput = {
          create: variant.physicalProducts,
        }
        break
      case "UPDATE":
        physicalProductsInput = {
          upsert: variant.physicalProducts.map(physicalProduct => ({
            create: physicalProduct,
            update: physicalProduct,
            where: { seasonsUID: physicalProduct.seasonsUID },
          })),
        }
        break
      default:
        physicalProductsInput = {}
    }
    return {
      sku: variant.sku,
      color: {
        connect: { id: colorID },
      },
      internalSize: {
        connect: { id: internalSize.id },
      },
      weight: variant.weight,
      productID: slug,
      retailPrice,
      total: variant.total,
      reservable: status === "Available" ? variant.total : 0,
      reserved: 0,
      nonReservable: status === "NotAvailable" ? variant.total : 0,
      physicalProducts: physicalProductsInput,
    }
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
