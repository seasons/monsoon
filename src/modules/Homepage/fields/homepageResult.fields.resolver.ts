import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("HomepageResult")
export class HomepageResultFieldsResolver {
  @ResolveField()
  __resolveType(@Parent() obj) {
    if (obj.__typename) {
      return obj.__typename
    } else if (obj.brand || obj.colorway) {
      return "Product"
    } else if (obj.since) {
      return "Brand"
    } else if (obj.subTitle) {
      return "Collection"
    }
    return null
  }
}
