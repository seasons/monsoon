import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import algoliasearch, { SearchIndex } from "algoliasearch"
import { gql } from "apollo-server"

const { ALGOLIA_ACCOUNT_ID, ALGOLIA_KEY } = process.env
@Injectable()
export class SearchService {
  client = algoliasearch(ALGOLIA_ACCOUNT_ID, ALGOLIA_KEY)
  index: SearchIndex

  constructor(private readonly prisma: PrismaService) {
    this.index = this.client.initIndex("dev_inventory")
  }

  async indexData() {
    await this.indexProducts()

    // await this.indexBrands()
  }

  async query(query: string): Promise<any[]> {
    const results = await this.index.search(query)
    return results.hits
  }

  async indexProducts() {
    try {
      const products = await this.prisma.binding.query.products(
        {},
        `
       {
        id
        slug
        name
        description
        type
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
        variants {
          id
          physicalProducts {
            id
          }
        }
        tags {
          name
        }
        status
        createdAt
        publishedAt
        updatedAt
        __typename
      }
    `
      )

      const productsForIndexing = products.map(
        ({
          id,
          name,
          slug,
          description,
          brand,
          category,
          images,
          variants,
          type,
          tags,
          status,
          createdAt,
          publishedAt,
        }) => {
          const variantsCount = variants.length
          const physicalProductsCount = variants
            .map((variant: any) => variant.physicalProducts.length)
            .reduce((a, b) => a + b, 0)
          // const availableSizes = variants.map((variant: any) => variant.size)

          return {
            objectID: id,
            kindOf: "Product",
            name,
            brandName: brand.name,
            image: images?.[0]?.url,
            description,
            variantsCount,
            physicalProductsCount,
            slug,
            // availableSizes,
            type,
            status,
            categoryName: category.name,
            tags: tags.map(a => a.name),
            createdAt: new Date(createdAt).getMilliseconds() / 1000,
            publishedAt: new Date(publishedAt).getMilliseconds() / 1000,
          }
        }
      )

      this.index.replaceAllObjects(productsForIndexing, {
        autoGenerateObjectIDIfNotExist: false,
      })
    } catch (err) {
      console.error(err)
    }
  }

  async indexBrands() {
    const brands = this.prisma.binding.query.brands(
      {},
      `
    {
      id
      name
      products {
        id
      }
    }
    `
    )
  }

  async indexPhysicalProducts() {}
}
