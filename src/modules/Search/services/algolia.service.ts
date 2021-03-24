import { Injectable } from "@nestjs/common"
import algoliasearch, { SearchIndex } from "algoliasearch"

const { ALGOLIA_ACCOUNT_ID, ALGOLIA_KEY } = process.env

export enum IndexKey {
  Default = "default",
  Admin = "admin",
  Website = "website",
  Customer = "customer",
  Product = "product",
  Brand = "brand",
  PhysicalProduct = "physical-product",
  ShopifyProductVariant = "shopify-product-variant",
}

@Injectable()
export class AlgoliaService {
  client = algoliasearch(ALGOLIA_ACCOUNT_ID, ALGOLIA_KEY)
  defaultIndex: SearchIndex
  indices: Map<IndexKey, SearchIndex> = new Map()

  constructor() {
    this.defaultIndex = this.client.initIndex(
      this.getEnvSpecificIndexName(IndexKey.Admin)
    )
    this.indices.set(IndexKey.Default, this.defaultIndex)
    this.indices.set(IndexKey.Admin, this.defaultIndex)
  }

  get environment() {
    const env = process.env.NODE_ENV

    if (env === "production") {
      return "production"
    } else if (env === "staging") {
      return "staging"
    }
    return "dev"
  }

  getEnvSpecificIndexName(indexName) {
    return `${indexName}_${this.environment}`
  }

  getIndex(indexKey: IndexKey) {
    if (this.indices.has(indexKey)) {
      return this.indices.get(indexKey)
    }

    const newIndex = this.client.initIndex(
      this.getEnvSpecificIndexName(indexKey)
    )
    this.indices.set(indexKey, newIndex)

    return newIndex
  }

  async reindex(data, indexKeys: IndexKey[] = [IndexKey.Default]) {
    const results = []

    for (const indexKey of indexKeys) {
      const index = this.getIndex(indexKey)

      const result = await index.saveObjects(data, {
        autoGenerateObjectIDIfNotExist: false,
      })

      results.push(result)
    }

    if (results.length === 1) {
      return results[0]
    }

    return results
  }
}
