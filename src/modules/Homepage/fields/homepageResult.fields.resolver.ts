import { Resolver, ResolveProperty } from "@nestjs/graphql"

@Resolver('HomepageResult')
export class HomepageResultFieldsResolver {
  @ResolveProperty()
  __resolveType(obj) {
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