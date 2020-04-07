import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("SearchResultType")
export class SearchResultTypeFieldsResolver {
  @ResolveField()
  __resolveType(@Parent() obj) {
    if (obj.brand) {
      return "Product"
    } else if (obj.since) {
      return "Brand"
    }
  }
}
