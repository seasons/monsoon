import { User } from "@app/decorators/user.decorator"
import { Query, Resolver } from "@nestjs/graphql"
@Resolver()
export class MeQueriesResolver {
  @Query()
  async me(@User() user) {
    if (!user) {
      return null
    }

    // The `Me` object gets deserialized from the MeFieldsResolver
    // We just have to tell the query that one `Me` will be returned
    return {}
  }
}
