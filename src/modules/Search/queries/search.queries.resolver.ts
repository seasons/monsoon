import { Args, Query, Resolver } from "@nestjs/graphql"

import { SearchService } from "../services/search.service"

@Resolver()
export class SearchQueriesResolver {
  constructor(private readonly searchService: SearchService) {}

  @Query()
  async search(@Args() { query }) {
    const indexes = ["brands", "products"]
    const result = await this.searchService.elasticsearch.search({
      index: indexes
        .map((a) => `${a}-${process.env.NODE_ENV ?? "staging"}`)
        .join(","),
      body: {
        query: {
          query_string: {
            query,
          },
        },
      },
    })

    const data = result.body.hits.hits.map(({ _score, _source }) => {
      return {
        data: _source,
        score: _score,
      }
    })

    return data
  }
}
