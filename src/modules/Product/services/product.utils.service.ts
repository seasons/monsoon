import { Injectable } from "@nestjs/common"
import { DBService } from "../../../prisma/DB.service"
import { BrandOrderByInput } from "../../../prisma"
import { PrismaClientService } from "../../../prisma/client.service"

@Injectable()
export class ProductUtilsService {
  constructor(
    private readonly db: DBService,
    private readonly prisma: PrismaClientService) {}

  async queryOptionsForProducts(args) {
    const category = args.category || "all"
    const orderBy = args.orderBy || "createdAt_DESC"
    const sizes = args.sizes || []
    // Add filtering by sizes in query
    const where = args.where || {}
    if (sizes && sizes.length > 0) {
      where.variants_some = { size_in: sizes }
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
      const category = await this.prisma.client.category({ slug: args.category })
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

  private async productsAlphabetically(
    category: string,
    orderBy: BrandOrderByInput,
    sizes: [string]
  ) {
    const brands = await this.db.query.brands(
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
    const products = brands.map(b => b.products).flat()
    return products
  }
}
