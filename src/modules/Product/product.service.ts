import { Injectable } from '@nestjs/common';
import { Prisma, BrandOrderByInput } from "../../prisma/prisma.binding"

@Injectable()
export class ProductService {
  async productsAlphabetically(
    db: Prisma,
    category: string,
    orderBy: BrandOrderByInput,
    sizes: [string]
  ) {
    const brands = await db.query.brands(
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