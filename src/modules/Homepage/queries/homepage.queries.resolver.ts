import { Select } from "@app/decorators/select.decorator"
import { Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class HomepageQueriesResolver {
  @Query()
  async homepage(@Select() select) {
    // All fields will be resolved by the field resolvers
    return {}
  }
}
