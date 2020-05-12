import { Injectable } from "@nestjs/common"
import { BrandOrderByInput, Category, Product } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { head, union, uniqBy } from "lodash"
import slugify from "slugify"

import {
  BottomSizeCreateInput,
  BottomSizeType,
  LetterSize,
  ProductType,
  Size,
  TopSizeCreateInput,
} from "../../../prisma"
import { ProductWithPhysicalProducts } from "../product.types"

@Injectable()
export class ProductUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories(prod: Product): Promise<Category[]> {
    const thisCategory = await this.prisma.client
      .product({ id: prod.id })
      .category()
    return [...(await this.getAllParentCategories(thisCategory)), thisCategory]
  }

  private async getAllParentCategories(
    category: Category
  ): Promise<Category[]> {
    const parent = head(
      await this.prisma.client.categories({
        where: { children_some: { id: category.id } },
      })
    )
    if (!parent) {
      return []
    } else {
      return [...(await this.getAllParentCategories(parent)), parent]
    }
  }

  async queryOptionsForProducts(args) {
    const category = args.category || "all"
    const brand = args.brand || "all"
    const orderBy = args.orderBy || "createdAt_DESC"
    const sizes = args.sizes || []
    // Add filtering by sizes in query
    const where = args.where || {}
    if (sizes && sizes.length > 0) {
      where.variants_some = { internalSize: { display_in: sizes } }
    }

    let brandFilter = {}
    if (brand !== "all") {
      brandFilter = {
        where: {
          ...args.where,
          brand: { slug: brand },
        },
      }
    }

    // If client wants to sort by name, we will assume that they
    // want to sort by brand name as well
    if (orderBy.includes("name_")) {
      return await this.productsAlphabetically(category, orderBy, sizes, brand)
    }

    const filters = await this.filtersForCategory(args)

    return {
      orderBy,
      where,
      ...filters,
      ...brandFilter,
    }
  }

  private async filtersForCategory(args) {
    if (args.category && args.category !== "all") {
      const category = await this.prisma.client.category({
        slug: args.category,
      })
      const children = await this.prisma.client
        .category({ slug: args.category })
        .children()

      return children.length > 0
        ? {
            where: {
              ...args.where,
              OR: children.map(({ slug }) => ({ category: { slug } })),
            },
          }
        : {
            where: {
              ...args.where,
              category: { slug: category.slug },
            },
          }
    }
    return {}
  }
  async getReservedBagItems(customer) {
    const reservedBagItems = await this.prisma.binding.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          status: "Reserved",
        },
      },
      `{
          id
          status
          position
          saved
          productVariant {
            id
          }
      }`
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

    const uniqueArray = uniqBy(variants, "internalSize.display")
    return uniqueArray.sort((variantA: any, variantB: any) => {
      const sortWeightA =
        (variantA.internalSize?.display &&
          sizes[variantA.internalSize?.display.toLowerCase()] &&
          sizes[variantA.internalSize?.display.toLowerCase()].sortWeight) ||
        0
      const sortWeightB =
        (variantB.internalSize?.display &&
          sizes[variantB.internalSize?.display.toLowerCase()] &&
          sizes[variantB.internalSize?.display.toLowerCase()].sortWeight) ||
        0
      return sortWeightA - sortWeightB
    })
  }

  getProductSlug(brandCode: string, name: string, color: string) {
    return slugify(brandCode + " " + name + " " + color).toLowerCase()
  }

  physicalProductsForProduct(product: ProductWithPhysicalProducts) {
    return product.variants.reduce(
      (acc, curVal) => union(acc, curVal.physicalProducts),
      []
    )
  }

  private async productsAlphabetically(
    category: string,
    orderBy: BrandOrderByInput,
    sizes: [string],
    brand: string
  ) {
    const brands = await this.prisma.binding.query.brands(
      { orderBy },
      `
      {
        name
        products(
          orderBy: name_ASC,
          where: {
            ${category !== "all" ? `category: { slug: "${category}" },` : ""}
            ${brand !== "all" ? `brand: { slug: "${brand}" },` : ""}
            status: Available,
            variants_some: { size_in: [${sizes}] }
          }
        ) {
          id
          name
          description
          images
          modelSize
          modelHeight
          externalURL
          tags
          retailPrice
          status
          createdAt
          updatedAt
          brand {
            id
            name
          }
          variants {
            id
            size
            total
            reservable
            nonReservable
            reserved
          }
        }
      }
      `
    )
    const products = brands.map(b => b.products).flat()
    return products
  }

  async deepUpsertSize({
    slug,
    type,
    display,
    topSizeData,
    bottomSizeData,
  }: {
    slug: string
    type: ProductType
    display: string
    topSizeData?: TopSizeCreateInput
    bottomSizeData?: BottomSizeCreateInput
  }): Promise<Size> {
    const sizeData = { slug, productType: type, display }
    // Update if needed
    const sizeRecord = await this.prisma.client.upsertSize({
      where: { slug },
      create: { ...sizeData },
      update: { ...sizeData },
    })
    switch (type) {
      case "Top":
        if (!topSizeData) {
          throw new Error("topSizeData must be non null if type is Top")
        }
        const prismaTopSize = await this.prisma.client
          .size({ id: sizeRecord.id })
          .top()
        const topSize = await this.prisma.client.upsertTopSize({
          where: { id: prismaTopSize?.id || "" },
          update: { ...topSizeData },
          create: { ...topSizeData },
        })
        if (!prismaTopSize) {
          await this.prisma.client.updateSize({
            where: { slug },
            data: { top: { connect: { id: topSize.id } } },
          })
        }
        break
      case "Bottom":
        if (!bottomSizeData) {
          throw new Error("bottomSizeData must be non null if type is Bottom")
        }
        const prismaBottomSize = await this.prisma.client
          .size({ id: sizeRecord?.id })
          .bottom()
        const bottomSize = await this.prisma.client.upsertBottomSize({
          where: { id: prismaBottomSize?.id || "" },
          create: { ...bottomSizeData },
          update: { ...bottomSizeData },
        })
        if (!prismaBottomSize) {
          await this.prisma.client.updateSize({
            where: { slug },
            data: { bottom: { connect: { id: bottomSize.id } } },
          })
        }
    }

    return sizeRecord
  }

  getProductImageName(brandCode: string, name: string, index: number) {
    return `${brandCode}/${name.replace(/ /g, "_")}/${index}.png`.toLowerCase()
  }

  async getImageIDsForURLs(imageURLs: string[]) {
    const prismaImages = await Promise.all(
      imageURLs.map(async imageURL => {
        const imageData = { originalUrl: imageURL }
        return await this.prisma.client.upsertImage({
          where: imageData,
          create: imageData,
          update: imageData,
        })
      })
    )
    return prismaImages.map(image => ({ id: image.id }))
  }

  async upsertModelSize({
    slug,
    type,
    modelSizeName,
    modelSizeDisplay,
    bottomSizeType,
  }: {
    slug: string
    type: ProductType
    modelSizeName: string
    modelSizeDisplay: string
    bottomSizeType?: BottomSizeType
  }) {
    return await this.deepUpsertSize({
      slug,
      type,
      display: modelSizeDisplay,
      topSizeData: type === "Top" && {
        letter: modelSizeName as LetterSize,
      },
      bottomSizeData: type === "Bottom" && {
        type: bottomSizeType as BottomSizeType,
        value: modelSizeName,
      },
    })
  }
}
