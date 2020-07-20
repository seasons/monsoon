import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import algoliasearch from "algoliasearch"

const { ALGOLIA_ACCOUNT_ID, ALGOLIA_KEY } = process.env
@Injectable()
export class SearchService {
  client = algoliasearch(ALGOLIA_ACCOUNT_ID, ALGOLIA_KEY)

  constructor(private readonly prisma: PrismaService) {}

  async indexProducts() {
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
