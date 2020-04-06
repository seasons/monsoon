import * as cheerio from "cheerio"
import request from "request"

import { Injectable } from "@nestjs/common"

import { PrismaService } from "../../../prisma/prisma.service"
import { ProductRequestUtilsService } from "./productRequest.utils.service"

@Injectable()
export class ProductRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productRequestUtils: ProductRequestUtilsService
  ) {}

  async addProductRequest(reason, url, user) {
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
          user
        )
        if (productRequest) {
          resolve(productRequest)
          return
        }

        // Then try looking for og (open graph) meta tags
        productRequest = await this.productRequestUtils.scrapeOGTags(
          $,
          reason,
          url,
          user
        )
        if (productRequest) {
          resolve(productRequest)
          return
        }

        // Otherwise, means we failed to scrape URL so just store
        // the reason and URL itself
        productRequest = await this.prisma.client.createProductRequest({
          reason,
          url,
          user: {
            connect: {
              id: user.id,
            },
          },
        })
        resolve(productRequest)
        return
      })
    })
  }
}
