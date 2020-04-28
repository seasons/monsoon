import {
  BagItem,
  Customer,
  ID_Input,
  Product,
  ProductFunction,
  RecentlyViewedProduct,
} from "@prisma/index"

import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import { ProductUtilsService } from "./product.utils.service"
import { ProductVariantService } from "./productVariant.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { head } from "lodash"

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
      architectureID,
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
    // const innerMaterials = await Promise.all(innerMaterials.map(async material =>
    //   await this.prisma.client.upsertMat({
    //   })
    // ))
    // const functionIDs = productFunctions
    //   .filter(Boolean)
    //   .map((func: ProductFunction) => ({ id: func.id }))
    const slug = await this.productUtils.getProductSlug(
      brand.brandCode,
      name,
      color.name
    )
    // const product = await this.prisma.client.createProduct({
    //   slug,
    //   name,
    //   brand: {
    //     connect: { id: brandID }
    //   },
    //   category: {
    //     connect: { id: categoryID }
    //   },
    //   type,
    //   description,
    //   modelHeight: model.height,
    //   retailPrice,
    //   model: {
    //     connect: { id: model.id }
    //   },
    //   modelSize: {
    //     connect: { id: modelSizeID }
    //   },
    //   color: {
    //     connect: { id: colorID }
    //   },
    //   secondaryColor: {
    //     connect: { id: secondaryColorID }
    //   },
    //   tags: {
    //     set: tags
    //   },
    //   functions: {
    //     connect: functionIDs
    //   },

    // })
    return null
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
