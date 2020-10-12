import { User } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { head } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"

export interface ProductGridItem {
  sizes: string
  name: string
  src: string
}

@Injectable()
export class EmailUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  productInfoForGridData = `
  type
  name
  variants {
    internalSize {
        productType
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
    if (firstXProducts?.length !== numProducts) {
      throw new Error(
        `Could not retrieve ${numProducts} reservable products for user`
      )
    }
    return firstXProducts.map(this.productToGridPayload)
  }

  private productToGridPayload = (product: any) => {
    const letterSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]
    let sizes = product.variants?.map(b => b.internalSize?.display)
    if (product.type === "Top") {
      sizes = sizes.sort((size1, size2) => {
        return letterSizes.indexOf(size1) - letterSizes.indexOf(size2)
      })
    }
    if (product.type === "Bottom") {
      sizes = sizes.sort()
    }
    return {
      sizes: `${sizes}`.replace(/,/g, " "),
      //@ts-ignore
      src: head(product.images)?.url,
      name: product.name,
    }
  }
}
