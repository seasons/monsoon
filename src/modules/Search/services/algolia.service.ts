import { Injectable } from "@nestjs/common"
import algoliasearch, { SearchIndex } from "algoliasearch"

const { ALGOLIA_ACCOUNT_ID, ALGOLIA_KEY } = process.env

const MASTER_INDEX = "dev_inventory"

@Injectable()
export class AlgoliaService {
  client = algoliasearch(ALGOLIA_ACCOUNT_ID, ALGOLIA_KEY)
  index: SearchIndex

  constructor() {
    this.index = this.client.initIndex(MASTER_INDEX)
  }
}
