import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import algoliasearch from "algoliasearch"

@Injectable()
export class SearchService {
  client = algoliasearch("YFWHA7229D", "4faf39592ff55234486984aa5080a754")

  constructor(private readonly prisma: PrismaService) {}

  async indexData() {
    try {
      const products = await this.prisma.binding.query.products(
        {},
        `
      {
        id
        name
        description
        images {
          url
          __typename
        }
        retailPrice
        brand {
          id
          name
          __typename
        }
        category {
          id
          name
          __typename
        }
        status
        createdAt
        updatedAt
        __typename
      } 
    `
      )

      const index = this.client.initIndex("dev_inventory")
      index.replaceAllObjects(products, {
        autoGenerateObjectIDIfNotExist: true,
      })
    } catch (err) {
      console.error(err)
    }
  }
}
