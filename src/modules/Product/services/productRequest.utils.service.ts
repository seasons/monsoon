import { Injectable } from "@nestjs/common"
import { Prisma, User } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"

@Injectable()
export class ProductRequestUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async scrapeLDJSON(
    $,
    reason: string,
    url: string,
    user: Pick<User, "id">,
    select: Prisma.ProductRequestSelect
  ) {
    // Search for json+ld in HTML body
    const ldJSONHTML = $("script[type='application/ld+json']").html()
    const ldJSON = ldJSONHTML !== "" && JSON.parse(ldJSONHTML)
    if (!ldJSON) {
      // Failed to extract json+ld from URL
      return null
    }

    // Extract fields from json+ld
    const { description, name, sku } = ldJSON
    const brand = ldJSON.brand ? ldJSON.brand.name : null
    const images = ldJSON.image ? ldJSON.image : null
    const price = ldJSON.offers ? ldJSON.offers.price : null
    const priceCurrency = ldJSON.offers ? ldJSON.offers.priceCurrency : null
    const productID = ldJSON.productID ? ldJSON.productID.toString() : null
    if (
      description &&
      name &&
      productID &&
      sku &&
      brand &&
      images &&
      price &&
      priceCurrency
    ) {
      return await this.createProductRequest(
        user,
        brand,
        description,
        images,
        name,
        price,
        priceCurrency,
        productID,
        reason,
        sku,
        url,
        select
      )
    } else {
      // Incorrectly formatted json+ld
      return null
    }
  }

  async scrapeOGTags(
    $,
    reason: string,
    url: string,
    user: Pick<User, "id">,
    select: Prisma.ProductRequestSelect
  ) {
    const ogDescription = $('meta[property="og:description"]').attr("content")
    const ogPriceAmount = parseInt(
      $('meta[property="og:price:amount"]').attr("content")
    )
    const ogPriceCurrency = $('meta[property="og:price:currency"]').attr(
      "content"
    )
    const ogSKU = $('meta[property="product:retailer_item_id"]').attr("content")
    const ogSiteName = $('meta[property="og:site_name"]').attr("content")
    const ogTitle = $('meta[property="og:title"]').attr("content")
    const productID = $('meta[itemprop="productID"]').attr("content")

    let ogImages: string[] = []
    $('meta[property="og:image"]').each((index, elem) => {
      ogImages.push($(elem).attr("content"))
    })

    if (
      ogDescription &&
      ogPriceAmount &&
      ogPriceCurrency &&
      ogSKU &&
      ogSiteName &&
      ogTitle &&
      productID &&
      ogImages
    ) {
      return await this.createProductRequest(
        user,
        ogSiteName,
        ogDescription,
        ogImages,
        ogTitle,
        ogPriceAmount,
        ogPriceCurrency,
        productID,
        reason,
        ogSKU,
        url,
        select
      )
    } else {
      return null
    }
  }

  async createProductRequest(
    user: Pick<User, "id">,
    brand: string,
    description: string,
    images: string[],
    name: string,
    price: number,
    priceCurrency: string,
    productID: string,
    reason: string,
    sku: string,
    url: string,
    select: Prisma.ProductRequestSelect
  ) {
    const productRequest = await this.prisma.client2.productRequest.create({
      data: {
        brand,
        description,
        images: {
          create: images.map((val, idx) => ({
            position: (idx + 1) * 1000,
            value: val,
          })),
        },
        name,
        price,
        priceCurrency,
        productID,
        reason,
        sku,
        url,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      select,
    })
    return productRequest
  }
}
