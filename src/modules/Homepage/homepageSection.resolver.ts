import { Resolver, Parent, ResolveProperty, Context, Args } from "@nestjs/graphql"
import { SectionTitle } from "./homepage.resolver"
import { DBService } from "../../prisma/DB.service"
import { prisma } from "../../prisma"

@Resolver("HomepageSection")
export class HomepageSectionResolver {
  constructor(private readonly dbService: DBService) {}

  @ResolveProperty()
  async results(@Parent() section, @Args() args) {
    switch (section.title) {
      case SectionTitle.FeaturedCollection:
        const collections = await prisma
          .collectionGroup({ slug: "homepage-1" })
          .collections()
        collections.forEach(element => {
          element.__typename = "Collection"
        })
        return collections
      case SectionTitle.JustAdded:
        const newProducts = await this.dbService.query.products(
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