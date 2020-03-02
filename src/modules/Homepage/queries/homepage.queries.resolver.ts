import { Resolver, Query } from "@nestjs/graphql"

@Resolver("Homepage")
export class HomepageQueriesResolver {
  @Query()
  async homepage() {
    // All fields will be resolved by the field resolvers
    return {}
  }
}


