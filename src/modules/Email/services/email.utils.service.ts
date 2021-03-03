import { ErrorService } from "@app/modules/Error/services/error.service"
import { ImageService } from "@app/modules/Image/services/image.service"
import { ID_Input, Order, Product, User } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { ProductGridItem } from "@seasons/wind"
import { head, pick, sampleSize, uniq } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"

export type MonsoonProductGridItem = ProductGridItem & {
  id: ID_Input
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
  brand {
    name
  }
  retailPrice
  variants {
    displayShort
  }
  images {
    url
  }
    `

  async createGridPayload(products: { id: string }[]) {
    const productsWithData = await this.prisma.binding.query.products(
      {
        where: { id_in: products.map(a => a.id) },
      },
      `{${this.productInfoForGridData}}`
    )
    return Promise.all(productsWithData.map(this.productToGridPayload))
  }

  async getXLatestProducts(
    numProducts: number
  ): Promise<MonsoonProductGridItem[]> {
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
  ): Promise<MonsoonProductGridItem[] | null> {
    let returnProducts = []

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

    if (returnProducts.length === 0) {
      this.error.setUserContext(user)
      this.error.captureMessage(
        `Unable to find ${numProducts} reservable products for email`
      )
    }

    return returnProducts
  }

  async formatOrderLineItems(
    order: Order
  ): Promise<
    {
      lineItemName: string
      lineItemValue: number // total in cents
    }[]
  > {
    const orderWithLineItems = await this.prisma.binding.query.order(
      {
        where: { id: order.id },
      },
      `{
        id
        lineItems {
          recordID
          recordType
          taxPrice
          price
        }
    }`
    )

    const formattedLineItems = []
    for (const li of orderWithLineItems.lineItems) {
      if (li.recordType === "PhysicalProduct") {
        formattedLineItems.push({
          lineItemName: await this.prisma.client
            .physicalProduct({
              id: li.recordID,
            })
            .productVariant()
            .product()
            .name(),
          lineItemValue: li.price,
        })
      } else if (li.recordType === "Package") {
        formattedLineItems.push({
          lineItemName: "Shipping",
          lineItemValue: li.price,
        })
      }
    }
    let totalTaxes = orderWithLineItems.lineItems.reduce(
      (acc, curval) => acc + curval.taxPrice,
      0
    )
    formattedLineItems.push({
      lineItemName: "Taxes",
      lineItemValue: totalTaxes,
    })
    return formattedLineItems
  }

  productToGridPayload = async (
    product: any
  ): Promise<MonsoonProductGridItem> => {
    const letterSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]
    let sizes = uniq(product.variants?.map(b => b.displayShort)) as string[]
    if (product.type === "Top") {
      sizes = sizes.sort((size1, size2) => {
        return letterSizes.indexOf(size1) - letterSizes.indexOf(size2)
      })
    }
    if (product.type === "Bottom") {
      sizes = sizes.sort()
    }
    const smallImageSrc = await this.image.resizeImage(
      product.images?.[0]?.url,
      "Small",
      { fm: "jpg" }
    )
    const bigImageSrc = await this.image.resizeImage(
      product.images?.[1]?.url,
      "Small",
      { fm: "jpg" }
    )
    const payload = {
      ...pick(product, ["id", "name", "retailPrice"]),
      sizes: `${sizes}`.replace(/,/g, " "),
      //@ts-ignore
      smallImageSrc,
      bigImageSrc,
      brand: product.brand?.name || "",
    }
    return payload
  }
}
