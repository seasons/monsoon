import { Injectable } from "@nestjs/common"
import { BrandOrderByInput } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { uniqBy } from "lodash"

@Injectable()
export class ProductUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async queryOptionsForProducts(args) {
    const category = args.category || "all"
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
      return await this.productsAlphabetically(category, orderBy, sizes)
    }

    const filters = await this.filtersForCategory(args)

    return {
      orderBy,
      where,
      ...filters,
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

  private async productsAlphabetically(
    category: string,
    orderBy: BrandOrderByInput,
    sizes: [string]
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
    const products = brands.map((b) => b.products).flat()
    return products
  }
}
