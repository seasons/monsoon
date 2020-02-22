import { Resolver, Parent, ResolveProperty, Context, Args } from "@nestjs/graphql"
import { SectionTitle } from "./homepage.resolver"

// FIXME: This is being used because currently info is lacking the __typename, add __typename to info
const ProductFragment = `{
  __typename
  id
  images
  name
  brand {
    id
    name
  }
  variants {
    id
    size
    reservable
  }
  color {
    name
  }
  retailPrice
}`

@Resolver("HomepageSection")
export class HomepageSectionResolver {
  @ResolveProperty()
  async results(@Parent() section, @Context() ctx, @Args() args) {
    switch (section.title) {
      case SectionTitle.FeaturedCollection:
        const collections = await ctx.prisma
          .collectionGroup({ slug: "homepage-1" })
          .collections()
        return collections
      case SectionTitle.JustAdded:
        const newProducts = await ctx.db.query.products(
          {
            ...args,
            orderBy: "createdAt_DESC",
            first: 8,
            where: {
              status: "Available",
            },
          },
          ProductFragment
        )
        return newProducts
      case SectionTitle.RecentlyViewed:
        // Will handle once auth stuff is finished
        return []
      default:
        const rails = await ctx.db.query.homepageProductRails(
          {
            where: {
              name: section.title
            }
          },
          `{
            products ${ProductFragment}
          }`
        )
        return Array.prototype.concat.apply([], rails.map(rail => rail.products))
    }
  }
}