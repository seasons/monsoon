import { Args, Query, Resolver } from "@nestjs/graphql"

import { SearchService } from "../services/search.service"

@Resolver()
export class SearchQueriesResolver {
  constructor(private readonly service: SearchService) {}

  @Query()
  async search(@Args() { query }) {
    const result = await this.service.query(query)

    const data = result.map(data => {
      return {
        kindOf: data.kindOf,
        data,
      }
    })
    return data
  }
}
