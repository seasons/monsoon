import { PrismaService } from "@app/prisma/prisma.service"
import { Controller, Get, Logger, Query } from "@nestjs/common"
import jsonexport from "jsonexport"
import { isEmpty } from "lodash"

@Controller("facebook")
export class FacebookSyncController {
  private readonly logger = new Logger(FacebookSyncController.name)
  private dataCache = {}

  constructor(private readonly prisma: PrismaService) {}

  @Get("catalog")
  async getCatalog(
    @Query("format") format,
    @Query("refresh") refresh = "false"
  ) {
    const data = await this.getDataAndCacheLocally(refresh === "true")

    return new Promise((resolve, reject) => {
      if (format === "csv") {
        try {
          jsonexport(data, (err, csv) => {
            if (err) {
              reject(err)
            }
            resolve(csv)
          })
        } catch (err) {
          console.log(err)
        }
      } else {
        resolve(data)
      }
    })
  }

  async getDataAndCacheLocally(refresh = false) {
    if (!isEmpty(this.dataCache) && !refresh) {
      return this.dataCache
    }

    this.logger.log("Refreshing cache")

    const allProducts = await this.prisma.binding.query.products(
      {},
      `
            {
                id
                slug
                type
                name
                description
                brand {
                    name
                }
                retailPrice
                images {
                    url
                }
                color {
                    name
                }
                status
            }
          `
    )

    const data = allProducts.map(product => {
      const {
        id,
        brand,
        color,
        images,
        name,
        description,
        retailPrice,
        slug,
        status,
      } = product
      return {
        id,
        title: name,
        description,
        availability:
          status === "Available" ? "available for order" : "out of stock",
        condition: "new",
        price: `${retailPrice} USD`,
        link: `https://www.wearseasons.com/product/${slug}`,
        image_link: images[0]?.url,
        brand: brand.name,
        color: color.name,
        fb_product_category: 472,
        additional_image_link: images
          .slice(1)
          .map(a => a.url)
          .join(","),
      }
    })

    this.logger.log(
      `Finished fetching ${data.length} products for Facebook catalog sync`
    )

    this.dataCache = data
    return data
  }
}
