import { ProductCommands } from "@app/modules/Scripts/commands/product.command"
import { Injectable } from "@nestjs/common"
import { Prisma, User } from "@prisma/client"
import * as cheerio from "cheerio"
import request from "request"

import { PrismaService } from "../../../prisma/prisma.service"
import { ProductRequestUtilsService } from "./productRequest.utils.service"

@Injectable()
export class ProductRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productRequestUtils: ProductRequestUtilsService
  ) {}

  async addProductRequest(
    reason: string,
    url: string,
    user: Pick<User, "id">,
    select: Prisma.ProductRequestSelect
  ) {
    return new Promise((resolve, reject) => {
      request({ jar: true, url }, async (error, response, body) => {
        // Handle a generic error
        if (error) {
          reject(error)
        }

        if (!user) {
          reject("Missing user from context")
        }

        const $ = cheerio.load(body, { xmlMode: false })

        // First try looking for ld+json
        let productRequest = await this.productRequestUtils.scrapeLDJSON(
          $,
          reason,
          url,
          user,
          select
        )
        if (productRequest) {
          resolve(this.prisma.sanitizePayload(productRequest, "ProductRequest"))
          return
        }

        // Then try looking for og (open graph) meta tags
        productRequest = await this.productRequestUtils.scrapeOGTags(
          $,
          reason,
          url,
          user,
          select
        )
        if (productRequest) {
          resolve(this.prisma.sanitizePayload(productRequest, "ProductRequest"))
          return
        }

        // Otherwise, means we failed to scrape URL so just store
        // the reason and URL itself
        productRequest = await this.prisma.client2.productRequest.create({
          data: {
            reason,
            url,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
          select,
        })
        resolve(this.prisma.sanitizePayload(productRequest, "ProductRequest"))
        return
      })
    })
  }
}
