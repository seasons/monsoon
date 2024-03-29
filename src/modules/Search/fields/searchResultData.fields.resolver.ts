import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("SearchResultData")
export class SearchResultDataFieldsResolver {
  @ResolveField()
  __resolveType(@Parent() obj) {
    switch (obj.kindOf) {
      case "Product":
        return "ProductSearchResultData"
      case "Brand":
        return "BrandSearchResultData"
      case "PhysicalProduct":
        return "PhysicalProductSearchResultData"
      case "Customer":
        return "CustomerSearchResultData"
      case "ShopifyProductVariant":
        return "ShopifyProductVariantSearchResultData"
    }
  }
}
