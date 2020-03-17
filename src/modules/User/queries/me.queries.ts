import { Resolver, Query } from "@nestjs/graphql"

@Resolver()
export class MeQueriesResolver {
  @Query()
  async me() {
    // The `Me` object gets deserialized from the MeFieldsResolver
    // We just have to tell the query that one `Me` will be returned
    return {}
  }
}
