import { ErrorService } from "@app/modules/Error/services/error.service"
import { ImageService } from "@app/modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import {
  Brand,
  Category,
  Image,
  Order,
  Prisma,
  Product,
  ProductVariant,
  User,
} from "@prisma/client"
import { ProductGridItem } from "@seasons/wind"
import { pick, sampleSize, uniq } from "lodash"

import { PrismaService } from "../../../prisma/prisma.service"

export type MonsoonProductGridItem = ProductGridItem & {
  id: string
}

export type ProductWithEmailData = Pick<
  Product,
  "id" | "type" | "name" | "retailPrice" | "slug"
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
    computedRentalPrice: true,
    variants: {
      select: {
        displayShort: true,
      },
    },
    images: { select: { url: true } },
    category: { select: { slug: true } },
    slug: true,
  })

  async createGridPayload(products: { id: string }[]) {
    const productsWithData = await this.prisma.client.product.findMany({
      where: { id: { in: products.map(a => a.id) } },
      select: this.productSelectForGridData,
    })
    return Promise.all(productsWithData.map(this.productToGridPayload))
  }

  async createGridPayloadWithProductVariants(variantIDs: string[]) {
    const variantsWithData = await this.prisma.client.productVariant.findMany({
      where: { id: { in: variantIDs } },
      select: {
        id: true,
        displayShort: true,
        product: {
          select: this.productSelectForGridData,
        },
      },
    })
    return Promise.all(variantsWithData.map(this.variantToGridPayload))
  }

  async getXLatestProducts(
    numProducts: number
  ): Promise<MonsoonProductGridItem[]> {
    const xLatestProducts = await this.prisma.client.product.findMany({
      where: {
        AND: [{ status: "Available" }, { category: { slug: { not: "tees" } } }],
      },
      orderBy: { publishedAt: "desc" },
      take: numProducts,
      select: this.productSelectForGridData,
    })
    return Promise.all(xLatestProducts.map(this.productToGridPayload))
  }

  async getXReservableProductsForUser(
    numProducts: number,
    user: Pick<User, "id" | "email">,
    products: ProductWithEmailData[]
  ): Promise<MonsoonProductGridItem[] | null> {
    let returnProducts = []

    // Filter out tees. We don't want those in emails
    const productsWithoutTees = products.filter(a => a.category.slug !== "tees")

    // Filter out from products we've already emailed to the user
    const customer = await this.prisma.client.customer.findFirst({
      where: { user: { id: user.id } },
      select: { emailedProducts: { select: this.productSelectForGridData } },
    })

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
    order: Pick<Order, "id">
  ): Promise<
    {
      lineItemName: string
      lineItemValue: number // total in cents
    }[]
  > {
    const orderWithLineItems = await this.prisma.client.order.findUnique({
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

    const physicalProductsInOrder = await this.prisma.client.physicalProduct.findMany(
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

  variantToGridPayload = async (
    variant: any
  ): Promise<MonsoonProductGridItem> => {
    const product = variant.product
    const productPayload = await this.productToGridPayload(product)

    const payload = {
      ...productPayload,
      variantSize: variant.displayShort,
    }
    return payload
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
      rentalPrice: product.computedRentalPrice,
      sizes: `${sizes}`.replace(/,/g, " "),
      // @ts-ignore
      smallImageSrc,
      bigImageSrc,
      brand: product.brand?.name || "",
    }
    return payload
  }
}
