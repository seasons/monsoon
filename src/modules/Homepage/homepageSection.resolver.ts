import { Resolver, Parent, ResolveProperty, Context, Args } from "@nestjs/graphql"
import { SectionTitle } from "./homepage.resolver"

@Resolver("HomepageSection")
export class HomepageSectionResolver {
  @ResolveProperty()
  async results(@Parent() section, @Context() ctx, @Args() args) {
    switch (section.title) {
      case SectionTitle.FeaturedCollection:
        const collections = await ctx.prisma
          .collectionGroup({ slug: "homepage-1" })
          .collections()
        collections.forEach(element => {
          element.__typename = "Collection"
        })
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
          `{
            __typename
            id
            images
            brand {
              name
            }
            name
            color {
              name
            }
            retailPrice
          }`
        )

        return newProducts
    }
  }
}