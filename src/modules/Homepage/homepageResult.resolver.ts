import { Resolver, ResolveProperty } from "@nestjs/graphql"

@Resolver('HomepageResult')
export class HomepageResultResolver {
  @ResolveProperty()
  __resolveType(obj) {
    return obj.__typename
  }
}