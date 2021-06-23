import { ErrorService } from "@app/modules/Error/services/error.service"
import { ImageService } from "@app/modules/Image/services/image.service"
import {
  Brand,
  Category,
  ID_Input,
  Image,
  Product,
  ProductVariant,
  User,
} from "@app/prisma"
import { Product as ProductBinding } from "@app/prisma/prisma.binding"
import { Injectable } from "@nestjs/common"
import { Order, Prisma } from "@prisma/client"
import { ProductGridItem } from "@seasons/wind"
import { head, pick, sampleSize, uniq } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"

export type MonsoonProductGridItem = ProductGridItem & {
  id: ID_Input
}

export type ProductWithEmailData = Pick<
  ProductBinding,
  "id" | "type" | "name" | "retailPrice"
> & {
  images: Pick<Image, "url">
  variants: Pick<ProductVariant, "displayShort">
  brand: Pick<Brand, "name">
  category: Pick<Category, "slug">
}

@Injectable()
export class EmailUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly error: ErrorService,
    private readonly image: ImageService
  ) {}

  productSelectForGridData = Prisma.validator<Prisma.ProductSelect>()({
    id: true,
    type: true,
    name: true,
    brand: { select: { name: true } },
    retailPrice: true,
    variants: { select: { displayShort: true } },
    images: { select: { url: true } },
    category: { select: { slug: true } },
    slug: true,
  })

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
    category {
      slug
    }
    slug
    `

  async createGridPayload(products: { id: string }[]) {
    const _productsWithData = await this.prisma.client2.product.findMany({
      where: { id: { in: products.map(a => a.id) } },
      select: this.productSelectForGridData,
    })
    const productsWithData = this.prisma.sanitizePayload(
      _productsWithData,
      "Product"
    )
    return Promise.all(productsWithData.map(this.productToGridPayload))
  }

  async getXLatestProducts(
    numProducts: number
  ): Promise<MonsoonProductGridItem[]> {
    const xLatestProducts = await this.prisma.binding.query.products(
      {
        where: {
          AND: [{ status: "Available" }, { category: { slug_not: "tees" } }],
        },
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
    products: ProductWithEmailData[]
  ): Promise<MonsoonProductGridItem[] | null> {
    let returnProducts = []

    // Filter out tees. We don't want those in emails
    const productsWithoutTees = products.filter(a => a.category.slug !== "tees")

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
    const reservableProductsWeHaventAlreadySent = productsWithoutTees.filter(
      a => !emailedProductsIDs.includes(a.id)
    )

    // Of the remaining ones, try to get numProducts. If we can't, allow repeats
    if (reservableProductsWeHaventAlreadySent.length >= numProducts) {
      returnProducts = await Promise.all(
        sampleSize(reservableProductsWeHaventAlreadySent, numProducts).map(
          this.productToGridPayload
        )
      )
    } else if (productsWithoutTees.length >= numProducts) {
      returnProducts = await Promise.all(
        sampleSize(productsWithoutTees, numProducts).map(
          this.productToGridPayload
        )
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
    const orderWithLineItems = await this.prisma.client2.order.findUnique({
      where: { id: order.id },
      select: {
        id: true,
        lineItems: {
          select: {
            recordType: true,
            recordID: true,
            taxPrice: true,
            price: true,
          },
        },
      },
    })

    const _physicalProductsInOrder = await this.prisma.client2.physicalProduct.findMany(
      {
        where: {
          id: {
            in: orderWithLineItems.lineItems
              .filter(a => a.recordType === "PhysicalProduct")
              .map(b => b.recordID),
          },
        },
        select: {
          id: true,
          productVariant: { select: { product: { select: { name: true } } } },
        },
      }
    )
    const physicalProductsInOrder = this.prisma.sanitizePayload(
      _physicalProductsInOrder,
      "PhysicalProduct"
    )
    const formattedLineItems = []
    for (const li of orderWithLineItems.lineItems) {
      if (li.recordType === "PhysicalProduct") {
        formattedLineItems.push({
          lineItemName: (physicalProductsInOrder.find(a => a.id === li.recordID)
            .productVariant as any).product.name,
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
      ...pick(product, ["id", "name", "retailPrice", "slug"]),
      sizes: `${sizes}`.replace(/,/g, " "),
      // @ts-ignore
      smallImageSrc,
      bigImageSrc,
      brand: product.brand?.name || "",
    }
    return payload
  }
}
