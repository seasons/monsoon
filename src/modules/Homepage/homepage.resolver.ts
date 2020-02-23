import { Resolver, ResolveProperty, Query, Context } from "@nestjs/graphql"
import { DBService } from "../../prisma/DB.service"

export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  JustAdded = "Just added",
  RecentlyViewed = "Recently viewed",
}

@Resolver("Homepage")
export class HomepageResolver {
  constructor(private readonly dbService: DBService) {}

  @Query()
  async homepage() {
    return {}
  }

  @ResolveProperty()
  async sections() {
    const productRails = await this.dbService.query.homepageProductRails(
      {},
      `{
        name
      }`
    )

    const sections = [
      {
        type: "CollectionGroups",
        __typename: "HomepageSection",
        title: SectionTitle[SectionTitle.FeaturedCollection]
      },
      {
        type: "Products",
        __typename: "HomepageSection",
        title: SectionTitle[SectionTitle.JustAdded]
      },
      {
        type: "Products",
        __typename: "HomepageSection",
        title: SectionTitle[SectionTitle.RecentlyViewed]
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


