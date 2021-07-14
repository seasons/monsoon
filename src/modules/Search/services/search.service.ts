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
    await this.indexShopifyProductVariants([
      ...indices,
      IndexKey.ShopifyProductVariant,
    ])
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

  async getRecentlyViewedProducts() {
    const PAGE_SIZE = 10000
    let recentlyViewedProducts = []
    let lastPageRecentlyViewedProducts
    do {
      lastPageRecentlyViewedProducts = await this.prisma.client2.recentlyViewedProduct.findMany(
        {
          skip: recentlyViewedProducts.length,
          take: PAGE_SIZE,
          orderBy: { id: "desc" },
          select: {
            id: true,
            product: {
              select: {
                id: true,
                brand: { select: { id: true, name: true, brandCode: true } },
              },
            },
            viewCount: true,
          },
        }
      )

      recentlyViewedProducts = recentlyViewedProducts.concat(
        lastPageRecentlyViewedProducts
      )
    } while (lastPageRecentlyViewedProducts.length === PAGE_SIZE)

    return this.prisma.sanitizePayload(
      recentlyViewedProducts,
      "RecentlyViewedProduct"
    )
  }

  async indexProducts(indices = [IndexKey.Default]) {
    const _products = await this.prisma.client2.product.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        type: true,
        images: { select: { url: true, updatedAt: true } },
        retailPrice: true,
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        variants: {
          select: { id: true, physicalProducts: { select: { id: true } } },
        },
        tags: { select: { name: true } },
        status: true,
        createdAt: true,
        publishedAt: true,
        updatedAt: true,
      },
    })
    const products = this.prisma.sanitizePayload(_products, "Product")

    const viewCounts = await this.getRecentlyViewedProducts()

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
          const updatedAt = image?.updatedAt?.toISOString()

          let url = "" //

          try {
            url = await this.image.resizeImage(imageURL, "Small", {
              updatedAt,
            })
          } catch (err) {}

          const payload = {
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
            createdAt: createdAt?.getTime() / 1000,
            publishedAt: publishedAt?.getTime() / 1000,
          }

          return payload
        }
      )
    )

    const result = await this.algolia.reindex(productsForIndexing, indices)

    this.logger.log("Done re-indexing products!")

    return result
  }

  async indexBrands(indices = [IndexKey.Default]) {
    const _brands = await this.prisma.client2.brand.findMany({
      select: {
        id: true,
        brandCode: true,
        name: true,
        description: true,
        designer: true,
        isPrimaryBrand: true,
        tier: true,
        published: true,
        websiteUrl: true,
        products: { select: { id: true } },
        createdAt: true,
        updatedAt: true,
      },
    })
    const brands = this.prisma.sanitizePayload(_brands, "Brand")

    const viewCounts = await this.getRecentlyViewedProducts()

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
          productsCount: products?.length || 0,
          popularity,
          tier,
          published,
          websiteUrl,
          createdAt: createdAt.getTime() / 1000,
          updatedAt: updatedAt.getTime() / 1000,
        }
      }
    )

    const result = await this.algolia.reindex(brandsForIndexing, indices)

    this.logger.log("Done re-indexing brands!")

    return result
  }

  async indexCustomers(indices = [IndexKey.Default]) {
    const _customers = await this.prisma.client2.customer.findMany({
      select: {
        id: true,
        plan: true,
        status: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        bagItems: { select: { id: true } },
        createdAt: true,
        updatedAt: true,
      },
    })
    const customers = this.prisma.sanitizePayload(_customers, "Customer")

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
          createdAt: createdAt.getTime() / 1000,
          updatedAt: updatedAt.getTime() / 1000,
        }
      }
    )

    const result = await this.algolia.reindex(customersForIndexing, indices)

    this.logger.log("Done re-indexing customers!")

    return result
  }

  async indexPhysicalProducts(indices = [IndexKey.Default]) {
    const _physicalProducts = await this.prisma.client2.physicalProduct.findMany(
      {
        select: {
          id: true,
          seasonsUID: true,
          inventoryStatus: true,
          sequenceNumber: true,
          productVariant: {
            select: { product: { select: { name: true } } },
          },
        },
      }
    )
    const physicalProducts = this.prisma.sanitizePayload(
      _physicalProducts,
      "PhysicalProduct"
    )

    this.logger.log(
      `Re-indexing ${physicalProducts.length} physical products...`
    )

    const physicalProductsForIndexing = physicalProducts.map(
      ({ id, ...data }) => {
        return {
          kindOf: "PhysicalProduct",
          objectID: id,
          productName: (data.productVariant as any).product.name,
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

  async indexShopifyProductVariants(
    indices = [IndexKey.Default],
    brandID?: string
  ) {
    const _shopifyProductVariants = await this.prisma.client2.shopifyProductVariant.findMany(
      {
        where: {
          brand: brandID ? { id: brandID } : { id: { not: undefined } },
        },
        select: {
          id: true,
          externalId: true,
          displayName: true,
          selectedOptions: { select: { name: true, value: true } },
          brand: { select: { id: true, name: true } },
          title: true,
          image: { select: { url: true } },
        },
      }
    )
    const shopifyProductVariants = this.prisma.sanitizePayload(
      _shopifyProductVariants,
      "ShopifyProductVariant"
    )

    this.logger.log(
      `Re-indexing ${shopifyProductVariants.length} ShopifyProductVariants...`
    )

    const shopifyProductVariantsForIndexing = shopifyProductVariants.map(
      ({ selectedOptions, brand, image, id, externalId, ...data }) => ({
        kindOf: "ShopifyProductVariant",
        objectID: id,
        brandID: brand?.id,
        externalID: externalId,
        brandName: brand?.name,
        image: image?.url,
        ...data,
      })
    )

    const result = await this.algolia.reindex(
      shopifyProductVariantsForIndexing,
      indices
    )

    return result
  }
}
