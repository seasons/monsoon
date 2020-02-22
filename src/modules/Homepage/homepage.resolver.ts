import { Resolver, ResolveProperty, Query, Context } from "@nestjs/graphql"

export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  JustAdded = "Just added",
  RecentlyViewed = "Recently viewed",
}

@Resolver("Homepage")
export class HomepageResolver {
  @Query()
  async homepage() {
    return {}
  }

  @ResolveProperty()
  async sections(@Context() ctx) {
    const productRails = await ctx.db.query.homepageProductRails(
      {},
      `{
        name
      }`
    )

    const sections = [
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
      {
        type: "Products",
        __typename: "HomepageSection",
        title: SectionTitle.RecentlyViewed,
      },
    ]

    productRails.forEach(rail => {
      sections.push({
        type: "HomepageProductRails",
        __typename: "HomepageSection",
        title: rail.name
      })
    })

    return sections
  }
}


