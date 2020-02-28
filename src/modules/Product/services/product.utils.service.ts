import { Injectable } from "@nestjs/common"
import { DBService } from "../../../prisma/DB.service"
import { BrandOrderByInput } from "../../../prisma"

@Injectable()
export class ProductUtilsService {
  constructor(private readonly db: DBService) {}

  async productsAlphabetically(
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
