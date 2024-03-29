import { ProductWithPhysicalProducts } from "@app/modules/Product/product.types"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ImageData } from "@modules/Image/image.types.d"
import { Injectable } from "@nestjs/common"
import { Customer, Prisma, ProductVariant, SizeType } from "@prisma/client"
import { Category, Product, Size } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import {
  flatten,
  head,
  identity,
  merge,
  pickBy,
  union,
  uniq,
  uniqBy,
} from "lodash"
import { pick } from "lodash"
import slugify from "slugify"

import { ProductType } from "../../../prisma"

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

  calcRentalPrice(
    product: Pick<
      Product,
      "rentalPriceOverride" | "wholesalePrice" | "recoupment"
    > & { category: Pick<Category, "dryCleaningFee" | "recoupment"> },
    options: { ignoreOverride?: boolean } = {}
  ) {
    let monthlyPriceInDollars
    const { ignoreOverride = false } = options

    const recoupment = product.recoupment || product.category.recoupment

    // Manually ensure everything is in cents for now. Need to go back and
    // get all price values in the DB into cents
    const rentalPriceOverrideCents = (product.rentalPriceOverride || 0) * 100
    const wholesalePriceCents = (product.wholesalePrice || 0) * 100
    const dryCleaningFeeCents = (product.category.dryCleaningFee || 0) * 1.5
    const reservationProcessingFeeCents = 300

    const roundToNearestMultipleOfFive = price => Math.ceil(price / 5) * 5

    let monthlyPriceInCents
    if (!ignoreOverride && product.rentalPriceOverride) {
      monthlyPriceInCents = rentalPriceOverrideCents
    } else {
      // Roll in 1.5 times the dry cleaning fee so on average, even if customers
      // hold the item for less than 30 days, we recoup a full dry cleaning fee.
      // Roll in 3 dollars for procssing so that on average, we recoup a full 5.50
      // processing fee per reservation no matter how many items or how long a customer
      // holds things.
      const baseUsageCharge = wholesalePriceCents / recoupment
      monthlyPriceInCents =
        baseUsageCharge + dryCleaningFeeCents + reservationProcessingFeeCents
    }
    monthlyPriceInDollars = roundToNearestMultipleOfFive(
      monthlyPriceInCents / 100
    )

    return Math.max(monthlyPriceInDollars, 10)
  }

  async getProductStyleCode(productID) {
    const prod = await this.prisma.client.product.findUnique({
      where: { id: productID },
      select: { id: true, variants: { select: { id: true, sku: true } } },
    })
    const firstVariant = head(prod?.variants)
    return !!firstVariant ? this.getStyleCodeFromSKU(firstVariant.sku) : null
  }

  getVariantDisplayShort(
    manufacturerSize: Pick<Size, "display" | "type" | "productType">,
    internalSize: Pick<Size, "display" | "type">
  ): string {
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
      displayShort = internalSize.display

      if (internalSize.type === "WxL") {
        displayShort = displayShort.split("x")[0]
      }
    }

    return displayShort
  }

  async getAllCategoriesForProduct(prod: Product): Promise<Category[]> {
    const prodWithCategory = await this.prisma.client.product.findUnique({
      where: { id: prod.id },
      include: { category: true },
    })
    const thisCategory = prodWithCategory.category
    return [...(await this.getAllParentCategories(thisCategory)), thisCategory]
  }

  async getAllCategoriesForCategory(category: {
    id: string
  }): Promise<Category[]> {
    const thisCategory = await this.prisma.client.category.findUnique({
      where: { id: category.id },
    })
    return [...(await this.getAllParentCategories(thisCategory)), thisCategory]
  }

  private async getAllParentCategories(
    category: Category
  ): Promise<Category[]> {
    const parent = await this.prisma.client.category.findFirst({
      where: { children: { some: { id: category.id } } },
    })
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
        ...pick(args, ["first", "last", "after", "before", "skip"]),
      },
      identity
    )
  }

  private async filters(args) {
    let brandFilter = { where: {} }
    let categoryFilter = { where: {} }
    let variantsFilter = { where: {} }
    let colorsFilter = { where: {} }
    let priceFilter = { where: {} }

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

    if (args.priceRange?.length > 1) {
      priceFilter = {
        where: {
          discountedPrice: {
            gte: args.priceRange[0],
            lt: args.priceRange[1],
          },
        },
      }
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
      const categoryWithChildren = await this.getCategoryAndAllChildren(
        { slug: args.category },
        { slug: true }
      )

      categoryFilter =
        categoryWithChildren?.length > 0
          ? {
              where: {
                ...args.where,
                ...brandFilter.where,
                category: { slug_in: categoryWithChildren.map(a => a.slug) },
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
              ...priceFilter.where,
            },
            {
              ...brandFilter.where,
              ...categoryFilter.where,
              ...colorsFilter.where,
              ...priceFilter.where,
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
          ...priceFilter.where,
        },
      }
    }
  }
  async getReservedBagItems(customer: Pick<Customer, "id">) {
    const reservedBagItems = await this.prisma.client.bagItem.findMany({
      where: { customer: { id: customer.id }, status: "Reserved" },
      select: {
        id: true,
        status: true,
        position: true,
        saved: true,
        productVariant: { select: { id: true } },
      },
    })
    return reservedBagItems
  }

  sortVariants(variants) {
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

    const firstVariant = variants?.[0]
    const productType = firstVariant?.internalSize?.productType
    const isTop = productType == "Top"

    const filteredVariants = isTop ? uniqBy(variants, "displayShort") : variants
    return filteredVariants.sort((variantA: any, variantB: any) => {
      const a = getSortWeight(variantA.displayShort) || 0
      const b = getSortWeight(variantB.displayShort) || 0

      return a - b
    })
  }

  async createProductSlug(brandCode: string, name: string, color: string) {
    const pureSlug = slugify(brandCode + " " + name + " " + color).toLowerCase()
    const numProductsWithSlug = await this.prisma.client.product.count({
      where: { slug: { startsWith: pureSlug } },
    })
    return `${pureSlug}${
      numProductsWithSlug > 0 ? "-" + numProductsWithSlug : ""
    }`
  }

  convertMeasurementSizeToInches(
    measurement: number,
    measurementType: string
  ): number {
    switch (measurementType) {
      case "Millimeters":
        return measurement / 25.4
      default:
        return measurement
    }
  }

  convertInchesToMeasurementSize(
    measurement: number,
    measurementType: string
  ): number {
    switch (measurementType) {
      case "Millimeters":
        return measurement * 25.4
      default:
        return measurement
    }
  }

  physicalProductsForProduct(product: ProductWithPhysicalProducts) {
    return product.variants.reduce(
      (acc, curVal) => union(acc, curVal.physicalProducts),
      []
    )
  }

  getManufacturerSizeMutateInput(
    variant: {
      sku: string
      manufacturerSizeType: string
    },
    manufacturerSizeName,
    type: ProductType,
    mutateType: "update" | "create"
  ) {
    const sizeType = variant.manufacturerSizeType
    const slug = `${variant.sku}-manufacturer-${sizeType}`

    const data = {
      slug,
      type: sizeType,
      display: manufacturerSizeName,
      productType: type,
    }
    return mutateType === "update"
      ? {
          where: { slug },
          data,
        }
      : data
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
        return await this.prisma.client.image.upsert({
          where: { url: imageData.url },
          create: { ...imageData, title: slug },
          update: { ...imageData, title: slug },
          select: { id: true },
        })
      })
    )
    return prismaImages.map(image => ({ id: image.id }))
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
    } as Prisma.ProductMaterialCategoryCreateInput
    return await this.prisma.client.productMaterialCategory.upsert({
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
    const productVariants = await this.prisma.client.productVariant.findMany({
      where: { product: { brand: { id: brandID } } },
      select: { id: true, sku: true },
    })
    const allStyleCodes = uniq(
      productVariants.map(a => this.getStyleCodeFromSKU(a.sku))
    )
    return allStyleCodes
  }

  getStyleCodeFromSKU(sku) {
    return sku?.split("-")?.pop()
  }

  async getSKUData({ brandID, colorCode, productID }) {
    const brand = await this.prisma.client.brand.findUnique({
      where: { id: brandID },
      select: { brandCode: true },
    })
    let product
    if (productID) {
      product = await this.prisma.client.product.findUnique({
        where: { id: productID },
        select: {
          variants: {
            select: {
              id: true,
            },
          },
        },
      })
    }
    const colorExists =
      (await this.prisma.client.color.count({
        where: { colorCode },
      })) > 0

    if (!brand || !colorExists) {
      return null
    }

    let styleNumber
    if (product?.variants?.length > 0) {
      // valid style code if variants exist on the product, null otherwise
      styleNumber = await this.getProductStyleCode(productID)
      if (!styleNumber) {
        throw new Error(`No style number found for productID: ${productID}`)
      }
    } else {
      const allStyleCodesForBrand = (
        await this.getAllStyleCodesForBrand(brandID)
      ).sort()
      const highestStyleNumber = Number(allStyleCodesForBrand.pop()) || 0
      styleNumber = highestStyleNumber + 1
    }

    const styleCode = styleNumber.toString().padStart(3, "0")

    return {
      brandCode: brand.brandCode,
      styleCode,
    }
  }

  async getCategoryAndAllChildren(
    where: Prisma.CategoryWhereUniqueInput,
    select: Prisma.CategorySelect
  ): Promise<(Partial<Category> & Pick<Category, "id" | "slug">)[]> {
    const categoryWithChildren = (await this.prisma.client.category.findUnique({
      where,
      select: merge(
        {
          id: true,
          slug: true,
          children: { select: merge({ id: true, slug: true }, select) },
        },
        select
      ),
    })) as any
    const allChildrenWithData = await Promise.all(
      categoryWithChildren.children.map(
        async a => await this.getCategoryAndAllChildren({ id: a.id }, select)
      )
    )
    return [categoryWithChildren, ...flatten(allChildrenWithData)] as any
  }

  async removeRestockNotifications(items: string[], customerID: string) {
    const restockNotifications = await this.prisma.client.productNotification.findMany(
      {
        where: {
          customer: {
            id: customerID,
          },
          productVariant: {
            id: { in: items },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }
    )

    if (restockNotifications?.length > 0) {
      return await this.prisma.client.productNotification.updateMany({
        where: { id: { in: restockNotifications.map(notif => notif.id) } },
        data: {
          shouldNotify: false,
        },
      })
    }
  }
}
