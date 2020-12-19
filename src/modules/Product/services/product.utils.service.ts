import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { ImageData } from "@modules/Image/image.types"
import { Injectable } from "@nestjs/common"
import {
  BrandOrderByInput,
  Category,
  Product,
  ProductMaterialCategoryCreateInput,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { head, identity, pickBy, union, uniq, uniqBy } from "lodash"
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

interface SizeConversion {
  tops: { JP: any; EU: any }
  bottoms: { JP: any; EU: any }
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

  async getVariantDisplayShort(
    manufacturerSizeIDs,
    internalSizeID
  ): Promise<string> {
    const query = `{
      id
      display
      bottom {
        id
        value
        type
      }
      top {
        id
        letter
      }
    }`
    const internalSize = await this.prisma.binding.query.size(
      {
        where: { id: internalSizeID },
      },
      query
    )

    // If top exit early because we are only using internalSizes for tops
    if (!!internalSize.top) return internalSize.top.letter

    const manufacturerSizes = await this.prisma.binding.query.sizes(
      {
        where: { id_in: manufacturerSizeIDs },
      },
      query
    )
    const manufacturerSize = head(manufacturerSizes)

    if (manufacturerSize) {
      const manufacturerSizeBottomType = manufacturerSize.bottom.type
      if (
        manufacturerSizeBottomType === "EU" ||
        manufacturerSizeBottomType === "JP"
      ) {
        return this.sizeConversion.bottoms[manufacturerSizeBottomType][
          manufacturerSize?.bottom.value
        ]
      } else {
        return manufacturerSize.display
      }
    } else {
      return internalSize.display
    }
  }

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
    console.log("args1", args)
    const category = args.category || "all"
    const brand = args.brand || "all"
    const orderBy = args.orderBy || "createdAt_DESC"
    const sizes = args.sizes || []

    // Add filtering by sizes in query
    const where = args.where || {}
    if (sizes && sizes.length > 0) {
      where.variants_some = { internalSize: { display_in: sizes } }
    }
    // If client wants to sort by name, we will assume that they
    // want to sort by brand name as well
    if (orderBy.includes("name_")) {
      return await this.productsAlphabetically(category, orderBy, sizes, brand)
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

    let paramFilters = {}

    if (args.brand && args.brand !== "all") {
      brandFilter = {
        where: {
          brand: { slug: args.brand },
        },
      }
    }

    if (args.bottoms && args.tops) {
      paramFilters = {
        variants_some: {
          AND: [
            { reservable_not: 0 },
            {
              manufacturerSizes_some: {
                OR: [
                  { bottom: { value_in: args.bottoms } },
                  { top: { letter_in: args.tops } },
                ],
              },
            },
          ],
        },
      }
    } else if (args.bottoms) {
      paramFilters = {
        variants_some: {
          manufacturerSizes_some: { bottom: { value_in: args.bottoms } },
        },
      }
    } else if (args.tops) {
      paramFilters = {
        variants_some: {
          manufacturerSizes_some: { top: { letter_in: args.tops } },
        },
      }
    }

    // First get all variants of size

    if (args.availableOnly) {
      paramFilters = {
        ...paramFilters,
        ...{
          variants_some: {
            reservable_not: 0,
          },
        },
      }
    }

    variantsFilter = {
      where: {
        ...paramFilters,
      },
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

    const whereFilter = {
      where: {
        ...brandFilter.where,
        ...categoryFilter.where,
        ...variantsFilter.where,
      },
    }

    console.log("wherefilter", whereFilter)
    return whereFilter
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
          images {
            id
            url
          }
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
        return await this.prisma.client.upsertImage({
          where: { url: imageData.url },
          create: { ...imageData, title: slug },
          update: { ...imageData, title: slug },
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
}
