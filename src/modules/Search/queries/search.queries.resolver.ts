import { Args, Query, Resolver } from "@nestjs/graphql"

import { SearchService } from "../services/search.service"

@Resolver()
export class SearchQueriesResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query()
  async search(@Args() { query }) {
    const indexes = ["brands", "products"]

    return []
  }
}
