import { Injectable } from "@nestjs/common"
import algoliasearch, { SearchIndex } from "algoliasearch"

const { ALGOLIA_ACCOUNT_ID, ALGOLIA_KEY } = process.env

export enum IndexKey {
  Default = "default",
  Admin = "dev_inventory",
  Customer = "seasons_external",
}

@Injectable()
export class AlgoliaService {
  client = algoliasearch(ALGOLIA_ACCOUNT_ID, ALGOLIA_KEY)
  defaultIndex: SearchIndex
  indices: Map<IndexKey, SearchIndex> = new Map()

  constructor() {
    this.defaultIndex = this.client.initIndex(IndexKey.Admin)
    this.indices.set(IndexKey.Default, this.defaultIndex)
    this.indices.set(IndexKey.Admin, this.defaultIndex)
  }

  getIndex(indexKey: IndexKey) {
    if (this.indices.has(indexKey)) {
      return this.indices.get(indexKey)
    }

    const newIndex = this.client.initIndex(indexKey)
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
