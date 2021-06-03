import { Select } from "@app/decorators/select.decorator"
import { User } from "@app/decorators/user.decorator"
import { Query, Resolver } from "@nestjs/graphql"
@Resolver()
export class MeQueriesResolver {
  @Query()
  async me(
    @User() user,
    // Need to call select here so field resolvers further down the tree can reference their ancestral selection sets
    @Select() select
  ) {
    // The `Me` object gets deserialized from the MeFieldsResolver
    // We just have to tell the query that one `Me` will be returned
    return {}
  }
}
