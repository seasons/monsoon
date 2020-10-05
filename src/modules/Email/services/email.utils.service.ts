import { Customer, User } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { head } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"

interface ProductGridItem {
  sizes: string
  name: string
  src: string
}

@Injectable()
export class EmailUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  productInfoForGridData = `
  name
  variants {
    internalSize {
        display
    }
  }
  images {
    url
  }
    `

  async getXLatestProducts(numProducts: number): Promise<ProductGridItem[]> {
    const xLatestProducts = await this.prisma.binding.query.products(
      {
        where: { status: "Available" },
        orderBy: "publishedAt_DESC",
        first: numProducts,
      },
      `{${this.productInfoForGridData}}`
    )
    return xLatestProducts.map(this.productToGridPayload)
  }

  async getXReservableProductsForUser(
    numProducts: number,
    user: User
  ): Promise<ProductGridItem[]> {
    const customer = head(
      await this.prisma.binding.query.customers(
        {
          where: { user: { id: user.id } },
        },
        `{
          triageStyles {
            ${this.productInfoForGridData}
          }
        }
        `
      )
    ) as any
    const firstXProducts = customer.triageStyles?.slice(0, numProducts)
    return firstXProducts.map(this.productToGridPayload)
  }

  private productToGridPayload = (product: any) => ({
    sizes: `${product.variants?.map(b => b.internalSize?.display)}`.replace(
      /,/g,
      " "
    ),
    //@ts-ignore
    src: head(product.images)?.url,
    name: product.name,
  })
}
