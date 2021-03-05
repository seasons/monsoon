import { ImageService } from "@app/modules/Image/services/image.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { pick } from "lodash"

import { AlgoliaService, IndexKey } from "./algolia.service"

enum SearchResultType {
  Product = "Product",
  Brand = "Brand",
  PhysicalProduct = "PhysicalProduct",
  Customer = "Customer",
}
export interface QueryOptions {
  filters?: string
  includeTypes?: [SearchResultType]
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly algolia: AlgoliaService,
    private readonly image: ImageService
  ) {}

  async indexData(indices = [IndexKey.Default, IndexKey.Admin]) {
    await this.indexProducts([...indices, IndexKey.Product])
    await this.indexBrands([...indices, IndexKey.Brand])
    await this.indexCustomers([...indices, IndexKey.Customer])
    await this.indexPhysicalProducts([...indices, IndexKey.PhysicalProduct])
  }

  async query(query: string, options?: QueryOptions): Promise<any[]> {
    let filters = !!options?.filters ? options?.filters + " OR " : ""
    let typeFilter = options?.includeTypes
      .map(type => `kindOf:${type}`)
      .join(" OR ")
    filters = filters += typeFilter

    const results = await this.algolia.defaultIndex.search(query, {
      filters,
    })
    return results.hits
  }

  async indexProducts(indices = [IndexKey.Default]) {
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
          updatedAt
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

    const viewCounts = await this.prisma.binding.query.recentlyViewedProducts(
      {},
      `
      {
        id
        product {
          id
          brand {
            id
            name
            brandCode
          }
        }
        viewCount
      }
    `
    )

    this.logger.log(`Re-indexing ${products.length} products...`)

    const productsForIndexing = await Promise.all(
      products.map(
        async ({
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
          const productViews = viewCounts.filter(
            view => view.product?.id === id
          )

          const image = images?.[0]
          const imageURL = image?.url
          const updatedAt = image?.updatedAt as string

          let url = "" //

          try {
            url = await this.image.resizeImage(imageURL, "Small", {
              updatedAt,
            })
          } catch (err) {}

          return {
            objectID: id,
            kindOf: "Product",
            name,
            brandName: brand.name,
            image: url,
            description,
            variantsCount,
            physicalProductsCount,
            slug,
            type,
            status,
            categoryName: category.name,
            tags: tags.map(a => a.name),
            popularity: productViews.length,
            createdAt: new Date(createdAt).getMilliseconds() / 1000,
            publishedAt: new Date(publishedAt).getMilliseconds() / 1000,
          }
        }
      )
    )

    const result = await this.algolia.reindex(productsForIndexing, indices)

    this.logger.log("Done re-indexing products!")

    return result
  }

  async indexBrands(indices = [IndexKey.Default]) {
    const brands = await this.prisma.binding.query.brands(
      {},
      `
    {
      id
      brandCode
      name
      description
      designer
      isPrimaryBrand
      tier
      published
      websiteUrl
      products {
        id
      }
      createdAt
      updatedAt
    }
    `
    )

    const viewCounts = await this.prisma.binding.query.recentlyViewedProducts(
      {},
      `
      {
        id
        product {
          id
          brand {
            id
            name
            brandCode
          }
        }
        viewCount
      }
    `
    )

    this.logger.log(`Re-indexing ${brands.length} brands...`)

    const brandsForIndexing = brands.map(
      ({
        id,
        brandCode,
        name,
        description,
        designer,
        products,
        isPrimaryBrand,
        tier,
        published,
        websiteUrl,
        createdAt,
        updatedAt,
      }) => {
        const brandViews = viewCounts.filter(
          view => view.product?.brand?.id === id
        )

        const popularity = brandViews.length + (isPrimaryBrand ? 300 : 0)

        return {
          objectID: id,
          kindOf: "Brand",
          name,
          brandCode,
          description,
          designer,
          isPrimaryBrand,
          productsCount: products.length,
          popularity,
          tier,
          published,
          websiteUrl,
          createdAt,
          updatedAt,
        }
      }
    )

    const result = await this.algolia.reindex(brandsForIndexing, indices)

    this.logger.log("Done re-indexing brands!")

    return result
  }

  async indexCustomers(indices = [IndexKey.Default]) {
    const customers = await this.prisma.binding.query.customers(
      {},
      `
      {
        id
        plan
        status
        user {
          id
          email
          firstName
          lastName
        }
        bagItems {
          id
        }
        createdAt
        updatedAt
      }
    `
    )

    this.logger.log(`Re-indexing ${customers.length} customers...`)

    const customersForIndexing = customers.map(
      ({ id, plan, status, user, bagItems, createdAt, updatedAt }) => {
        return {
          objectID: id,
          kindOf: "Customer",
          plan,
          status,
          email: user.email,
          user,
          bagItemsCount: bagItems.length,
          popularity: status === "Active" ? 100 : 0 + bagItems.length * 2,
          createdAt,
          updatedAt,
        }
      }
    )

    const result = await this.algolia.reindex(customersForIndexing, indices)

    this.logger.log("Done re-indexing customers!")

    return result
  }

  async indexPhysicalProducts(indices = [IndexKey.Default]) {
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

    this.logger.log(
      `Re-indexing ${physicalProducts.length} physical products...`
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

    const result = await this.algolia.reindex(
      physicalProductsForIndexing,
      indices
    )

    this.logger.log("Done re-indexing brands!")

    return result
  }
}
