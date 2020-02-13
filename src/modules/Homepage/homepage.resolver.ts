import { Resolver, ResolveProperty, Query } from "@nestjs/graphql"

export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  JustAdded = "Just added"
}

@Resolver("Homepage")
export class HomepageResolver {
  @Query()
  async homepage() {
    return {}
  }

  @ResolveProperty()
  async sections() {
    return [
      {
        type: "CollectionGroups",
        __typename: "HomepageSection",
        title: SectionTitle.FeaturedCollection
      },
      {
        type: "Products",
        __typename: "HomepageSection",
        title: SectionTitle.JustAdded
      },
    ]
  }
}


