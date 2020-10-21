import { ErrorService } from "@app/modules/Error/services/error.service"
import { ImageService } from "@app/modules/Image/services/image.service"
import { ID_Input, LetterSize, Product, User } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { head, sampleSize, uniq } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"

export interface ProductGridItem {
  id: ID_Input
  sizes: string
  name: string
  src1: string
  src2: string
}

@Injectable()
export class EmailUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly error: ErrorService,
    private readonly image: ImageService
  ) {}

  productInfoForGridData = `
  id
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
    return Promise.all(xLatestProducts.map(this.productToGridPayload))
  }

  async getXReservableProductsForUser(
    numProducts: number,
    user: User,
    products: Product[]
  ): Promise<ProductGridItem[] | null> {
    let returnProducts = null

    // Filter out from products we've already emailed to the user
    const customer = head(
      await this.prisma.binding.query.customers(
        {
          where: { user: { id: user.id } },
        },
        `{
          emailedProducts {
            ${this.productInfoForGridData}
          }
        }
        `
      )
    ) as any
    const emailedProductsIDs = customer.emailedProducts.map(a => a.id)
    const reservableProductsWeHaventAlreadySent = products.filter(
      a => !emailedProductsIDs.includes(a.id)
    )

    // Of the remaining ones, try to get numProducts. If we can't, allow repeats
    if (reservableProductsWeHaventAlreadySent.length >= numProducts) {
      returnProducts = await Promise.all(
        sampleSize(reservableProductsWeHaventAlreadySent, numProducts).map(
          this.productToGridPayload
        )
      )
    } else if (products.length >= numProducts) {
      returnProducts = await Promise.all(
        sampleSize(products, numProducts).map(this.productToGridPayload)
      )
    }

    if (returnProducts === null) {
      this.error.setUserContext(user)
      this.error.captureMessage(
        `Unable to find ${numProducts} reservable products for email`
      )
    }

    return returnProducts
  }

  productToGridPayload = async (product: any) => {
    const letterSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]
    let sizes = uniq(
      product.variants?.map(b => b.internalSize?.display)
    ) as LetterSize[]
    if (product.type === "Top") {
      sizes = sizes.sort((size1, size2) => {
        return letterSizes.indexOf(size1) - letterSizes.indexOf(size2)
      })
    }
    if (product.type === "Bottom") {
      sizes = sizes.sort()
    }
    const src1 = await this.image.resizeImage(
      product.images?.[0].url,
      "Small",
      { fm: "jpg" }
    )
    const src2 = await this.image.resizeImage(
      product.images?.[1].url,
      "Small",
      { fm: "jpg" }
    )
    const payload = {
      id: product.id,
      sizes: `${sizes}`.replace(/,/g, " "),
      //@ts-ignore
      src1,
      src2,
      name: product.name,
    }
    return payload
  }
}
