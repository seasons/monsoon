import { Resolver, ResolveProperty, Parent } from "@nestjs/graphql"

@Resolver('SearchResultType')
export class SearchResultTypeFieldsResolver {
  @ResolveProperty()
  __resolveType(@Parent() obj) {
    if (obj.brand) {
      return "Product"
    } else if (obj.since) {
      return "Brand"
    }
  }
}