import { InvoicesForCustomersLoader } from "@app/modules/Payment/loaders/invoicesForCustomers.loaders"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ImageData } from "@modules/Image/image.types"
import { Injectable } from "@nestjs/common"
import { ProductVariant } from "@prisma/client"
import { Category, Prisma, Product, Size } from "@prisma/client"
import {
  AccessorySizeCreateInput,
  BottomSizeCreateInput,
  BrandOrderByInput,
  ProductMaterialCategoryCreateInput,
  SizeType,
  TopSizeCreateInput,
} from "@prisma1/index"
import { PrismaService } from "@prisma1/prisma.service"
import { head, identity, pickBy, size, union, uniq, uniqBy } from "lodash"
import slugify from "slugify"

import { BottomSizeType, LetterSize, ProductType } from "../../../prisma"
import { ProductWithPhysicalProducts } from "../product.types"

type JPSize = "0" | "1" | "2" | "3" | "4"
type EUSize = "28" | "30" | "32" | "34" | "36" | "38" | "40" | "42"

interface SizeConversion {
  tops: { JP: JPSize; EU: EUSize }
  bottoms: { JP: JPSize; EU: EUSize }
}

@Injectable()
export class ProductUtilsService {
  sizeConversion: SizeConversion
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {
    this.sizeConversion = this.utils.parseJSONFile(
      "src/modules/Product/sizeConversion"
    )
  }

  async getProductStyleCode(productID) {
    const prod = this.prisma.sanitizePayload(
      await this.prisma.client2.product.findUnique({
        where: { id: productID },
        select: { id: true, variants: { select: { id: true, sku: true } } },
      }),
      "Product"
    ) as Product & { variants: [ProductVariant] }
    const firstVariant = head(prod?.variants)
    return !!firstVariant ? this.getStyleCodeFromSKU(firstVariant.sku) : null
  }

  async getVariantDisplayShort(
    manufacturerSizeIDs = [],
    internalSizeID
  ): Promise<string> {
    const select = Prisma.validator<Prisma.SizeSelect>()({
      id: true,
      display: true,
      productType: true,
      type: true,
      bottom: { select: { id: true, value: true, type: true } },
      top: { select: { id: true, letter: true } },
    })

    const _manufacturerSize = await this.prisma.client2.size.findFirst({
      where: { id: { in: manufacturerSizeIDs.map(a => a?.id) } },
      select,
    })
    const manufacturerSize = this.prisma.sanitizePayload(
      _manufacturerSize,
      "Size"
    )

    // There *should* always be a manufacturer size display,
    // but just to be safe we fallback to internal size display
    let displayShort
    if (manufacturerSize?.display) {
      displayShort = this.coerceSizeDisplayIfNeeded(
        manufacturerSize.display,
        manufacturerSize.type as SizeType,
        manufacturerSize.productType as ProductType
      )
      if (manufacturerSize.type === "WxL") {
        displayShort = displayShort.split("x")[0]
      }
    } else {
      const internalSize = await this.prisma.client2.size.findUnique({
        where: { id: internalSizeID },
        select,
      })
      displayShort = internalSize.display

      if (internalSize.type === "WxL") {
        displayShort = displayShort.split("x")[0]
      }
    }

    return displayShort
  }

  async getAllCategories(prod: Product): Promise<Category[]> {
    const _prodWithCategory = await this.prisma.client2.product.findUnique({
      where: { id: prod.id },
      include: { category: true },
    })
    const prodWithCategory = this.prisma.sanitizePayload(
      _prodWithCategory,
      "Product"
    )
    const thisCategory = prodWithCategory.category
    return [...(await this.getAllParentCategories(thisCategory)), thisCategory]
  }

  private async getAllParentCategories(
    category: Category
  ): Promise<Category[]> {
    const parent = this.prisma.sanitizePayload(
      head(
        await this.prisma.client2.category.findMany({
          where: { children: { some: { id: category.id } } },
        })
      ),
      "Category"
    )
    if (!parent) {
      return []
    } else {
      return [...(await this.getAllParentCategories(parent)), parent]
    }
  }

  async queryOptionsForProducts(args) {
    const where = args.where || {}
    const orderBy = args.orderBy || "createdAt_DESC"
    const sizes = args.sizes || []

    // Add filtering by sizes in query
    if (sizes && sizes.length > 0) {
      where.variants_some = { displayShort: { display_in: sizes } }
    }

    const filters = await this.filters(args)

    return pickBy(
      {
        orderBy,
        where: {
          ...where,
          ...filters?.where,
        },
      },
      identity
    )
  }

  private async filters(args) {
    let brandFilter = { where: {} }
    let categoryFilter = { where: {} }
    let variantsFilter = { where: {} }
    let colorsFilter = { where: {} }
    let forSaleFilter = { where: {} }

    if (args.brand && args.brand !== "all") {
      brandFilter = {
        where: {
          brand: { slug: args.brand },
        },
      }
    }

    if (args.brands?.length > 0 && !args.brands?.includes("all")) {
      brandFilter = {
        where: {
          brand: { slug_in: args.brands },
        },
      }
    }

    if (args.colors?.length > 0) {
      colorsFilter = { where: { color: { slug_in: args.colors } } }
    }

    const productVariantWhereArray = []

    if (args.availableOnly) {
      productVariantWhereArray.push({ reservable_not: 0 })
    }

    if (args.bottoms?.length > 0 && args.tops?.length > 0) {
      productVariantWhereArray.push(
        { displayShort_in: [...args.bottoms, ...args.tops] },
        {
          OR: [
            {
              manufacturerSizes_some: {
                productType_in: ["Bottom", "Top"],
              },
            },
            {
              internalSize: {
                productType_in: ["Bottom", "Top"],
              },
            },
          ],
        }
      )
    } else if (args.bottoms?.length > 0) {
      productVariantWhereArray.push(
        { displayShort_in: args.bottoms },
        {
          OR: [
            {
              manufacturerSizes_every: {
                productType: "Bottom",
              },
            },
            {
              internalSize: {
                productType: "Bottom",
              },
            },
          ],
        }
      )
    } else if (args.tops?.length > 0) {
      productVariantWhereArray.push(
        { displayShort_in: args.tops },
        {
          OR: [
            {
              manufacturerSizes_every: {
                productType: "Top",
              },
            },
            {
              internalSize: {
                productType: "Top",
              },
            },
          ],
        }
      )
    }

    if (productVariantWhereArray.length > 0) {
      variantsFilter = {
        where: {
          variants_some: {
            AND: productVariantWhereArray,
          },
        },
      }
    }

    if (args.category && args.category !== "all") {
      const allCategoriesWithChildren = await this.prisma.binding.query.categories(
        {},
        `
        {
          id
          slug
          children {
            id
            slug
          }
        }
      `
      )

      const getChildren = (categorySlug, results = []) => {
        const category = allCategoriesWithChildren.find(
          cat => cat.slug === categorySlug
        )
        if (category?.children.length > 0) {
          results.push(categorySlug)
          category.children.forEach(child => {
            getChildren(child.slug, results)
          })
        } else {
          results.push(categorySlug)
        }
        return results
      }

      const children = getChildren(args.category)

      categoryFilter =
        children?.length > 0
          ? {
              where: {
                ...args.where,
                ...brandFilter.where,
                category: { slug_in: uniq(children) },
              },
            }
          : {
              where: {
                ...args.where,
                ...brandFilter.where,
                category: { slug: args.category || "" },
              },
            }
    }

    if (args.forSaleOnly) {
      return {
        where: {
          OR: [
            {
              buyNewEnabled: true,
              ...brandFilter.where,
              ...categoryFilter.where,
              ...colorsFilter.where,
              ...variantsFilter.where,
            },
            {
              ...brandFilter.where,
              ...categoryFilter.where,
              ...colorsFilter.where,
              variants_some: {
                AND: [
                  ...productVariantWhereArray,
                  {
                    physicalProducts_some: { price: { buyUsedEnabled: true } },
                  },
                ],
              },
            },
          ],
        },
      }
    } else {
      return {
        where: {
          ...brandFilter.where,
          ...categoryFilter.where,
          ...colorsFilter.where,
          ...variantsFilter.where,
        },
      }
    }
  }
  async getReservedBagItems(customer) {
    const _reservedBagItems = await this.prisma.client2.bagItem.findMany({
      where: { customer: { id: customer.id }, status: "Reserved" },
      select: {
        id: true,
        status: true,
        position: true,
        saved: true,
        productVariant: { select: { id: true } },
      },
    })
    const reservedBagItems = this.prisma.sanitizePayload(
      _reservedBagItems,
      "BagItem"
    )
    return reservedBagItems
  }

  sortVariants(variants) {
    const sizes = {
      xs: {
        sortWeight: 0,
      },
      s: {
        sortWeight: 1,
      },
      m: {
        sortWeight: 2,
      },
      l: {
        sortWeight: 3,
      },
      xl: {
        sortWeight: 4,
      },
      xxl: {
        sortWeight: 5,
      },
    }

    const getSortWeight = displayShort => {
      switch (displayShort.toLowerCase()) {
        case "xxs":
          return 0
        case "xs":
          return 1
        case "s":
          return 2
        case "m":
          return 3
        case "l":
          return 4
        case "xl":
          return 5
        case "xxl":
          return 6
        default:
          return displayShort
      }
    }

    const uniqueArray = uniqBy(variants, "displayShort")
    return uniqueArray.sort((variantA: any, variantB: any) => {
      const a = getSortWeight(variantA.displayShort) || 0
      const b = getSortWeight(variantB.displayShort) || 0

      return a - b
    })
  }

  async getProductSlug(
    brandCode: string,
    name: string,
    color: string,
    createNew: boolean
  ) {
    const pureSlug = slugify(brandCode + " " + name + " " + color).toLowerCase()
    if (createNew) {
      const numProductsWithSlug = await this.prisma.client2.product.count({
        where: { slug: { startsWith: pureSlug } },
      })
      return `${pureSlug}${
        numProductsWithSlug > 0 ? "-" + numProductsWithSlug : ""
      }`
    }

    return pureSlug
  }

  physicalProductsForProduct(product: ProductWithPhysicalProducts) {
    return product.variants.reduce(
      (acc, curVal) => union(acc, curVal.physicalProducts),
      []
    )
  }

  async deepUpsertSize({
    slug,
    type,
    display,
    topSizeData,
    bottomSizeData,
    accessorySizeData,
    sizeType,
  }: {
    slug: string
    type: ProductType
    sizeType: SizeType
    display: string
    topSizeData?: TopSizeCreateInput
    bottomSizeData?: BottomSizeCreateInput
    accessorySizeData?: AccessorySizeCreateInput
  }): Promise<Size> {
    const sizeData = { slug, productType: type, display, type: sizeType }
    const sizeRecord = await this.prisma.client2.size.upsert({
      where: { slug },
      create: { ...sizeData },
      update: { ...sizeData },
    })
    if (!!bottomSizeData || !!topSizeData || !!accessorySizeData) {
      switch (type) {
        case "Accessory":
          const prismaAccessorySize = await this.prisma.client
            .size({ id: sizeRecord.id })
            .accessory()
          const accessorySize = await this.prisma.client.upsertAccessorySize({
            where: { id: prismaAccessorySize?.id || "" },
            update: { ...accessorySizeData },
            create: { ...accessorySizeData },
          })
          if (!prismaAccessorySize) {
            await this.prisma.client.updateSize({
              where: { slug },
              data: { accessory: { connect: { id: accessorySize.id } } },
            })
          }
          break
        case "Top":
          await this.prisma.client2.size.update({
            where: { slug },
            data: {
              top: {
                upsert: { create: topSizeData as any, update: topSizeData },
              },
            },
          })
          break
        case "Bottom":
          await this.prisma.client2.size.update({
            where: { slug },
            data: {
              bottom: {
                upsert: {
                  create: bottomSizeData as any,
                  update: bottomSizeData,
                },
              },
            },
          })
      }
    }

    return sizeRecord
  }

  getProductImageName(
    brandCode: string,
    name: string,
    colorName: string,
    index: number
  ) {
    const slug = slugify(name + " " + colorName).toLowerCase()
    return `${brandCode}/${slug}/${slug}-${index}.png`.toLowerCase()
  }

  async getImageIDs(imageDatas: ImageData[], slug: string) {
    const prismaImages = await Promise.all(
      imageDatas.map(async imageData => {
        return await this.prisma.client2.image.upsert({
          where: { url: imageData.url },
          create: { ...imageData, title: slug },
          update: { ...imageData, title: slug },
          select: { id: true },
        })
      })
    )
    return prismaImages.map(image => ({ id: image.id }))
  }

  async upsertModelSize({
    slug,
    type,
    modelSizeDisplay,
    sizeType,
  }: {
    slug: string
    type: ProductType
    modelSizeDisplay: string
    sizeType?: SizeType
  }) {
    return await this.deepUpsertSize({
      slug,
      type,
      display: modelSizeDisplay,
      sizeType,
    })
  }

  async upsertMaterialCategory(material, category) {
    const data = {
      slug: material.model.name,
      lifeExpectancy: material.model.lifeExpectancy,
      category: {
        connect: {
          slug: category.model.slug,
        },
      },
    } as ProductMaterialCategoryCreateInput
    return await this.prisma.client.upsertProductMaterialCategory({
      where: { slug: material.model.name },
      create: data,
      update: data,
    })
  }

  coerceSizeDisplayIfNeeded(
    display: string,
    sizeType: SizeType,
    productType: ProductType
  ) {
    let conversion = display

    if (sizeType === "JP" || sizeType === "EU") {
      const sizeConversion = this.utils.parseJSONFile(
        "src/modules/Product/sizeConversion"
      )
      conversion =
        sizeConversion?.[productType.toLowerCase()]?.[sizeType]?.[display]
    }

    return conversion
  }

  async getAllStyleCodesForBrand(brandID) {
    const _productVariants = await this.prisma.client2.productVariant.findMany({
      // TODO: SCHEMABREAK
      where: { product: { every: { brand: { id: brandID } } } },
      select: { id: true, sku: true },
    })
    const productVariants = this.prisma.sanitizePayload(
      _productVariants,
      "ProductVariant"
    )
    const allStyleCodes = uniq(
      productVariants.map(a => this.getStyleCodeFromSKU(a.sku))
    )
    return allStyleCodes
  }

  getStyleCodeFromSKU(sku) {
    return sku?.split("-")?.pop()
  }
}
