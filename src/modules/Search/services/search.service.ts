import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import { pick, rest } from "lodash"

import { AlgoliaService } from "./algolia.service"

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly algolia: AlgoliaService
  ) {}

  async indexData() {
    await this.indexProducts()
  }

  async query(query: string): Promise<any[]> {
    const results = await this.algolia.index.search(query)
    return results.hits
  }

  async indexProducts() {
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
          type,
          status,
          categoryName: category.name,
          tags: tags.map(a => a.name),
          createdAt: new Date(createdAt).getMilliseconds() / 1000,
          publishedAt: new Date(publishedAt).getMilliseconds() / 1000,
        }
      }
    )

    return this.algolia.index.saveObjects(productsForIndexing, {
      autoGenerateObjectIDIfNotExist: false,
    })
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

  async indexPhysicalProducts() {
    const physicalProducts = await this.prisma.binding.query.physicalProducts(
      {},
      `{
        id
        seasonsUID
        inventoryStatus
        sequenceNumber
        productVariant {
          product {
            name
          }
        }
        __typename
      }
    `
    )

    const physicalProductsForIndexing = physicalProducts.map(
      ({ id, ...data }) => {
        return {
          kindOf: "PhysicalProduct",
          objectID: id,
          productName: data.productVariant.product.name,
          barcode: `SZNS` + `${data.sequenceNumber}`.padStart(5, "0"),
          ...pick(data, ["seasonsUID", "inventoryStatus"]),
        }
      }
    )

    return this.algolia.index.saveObjects(physicalProductsForIndexing, {
      autoGenerateObjectIDIfNotExist: false,
    })
  }
}
