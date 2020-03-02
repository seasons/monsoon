import { Resolver, ResolveProperty, Parent } from "@nestjs/graphql"

@Resolver('HomepageResult')
export class HomepageResultFieldsResolver {
  @ResolveProperty()
  __resolveType(@Parent() obj) {
    if (obj.brand || obj.colorway) {
      return "Product"
    } else if (obj.subTitle) {
      return "Collection"
    } else if (obj.name) {
      return "HomepageProductRail"
    }
    return null
  }
}