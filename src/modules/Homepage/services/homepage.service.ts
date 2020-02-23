<<<<<<< HEAD:src/modules/Homepage/services/homepage.service.ts
import { Injectable } from "@nestjs/common"
import { DBService } from "../../../prisma/DB.service"
=======
import { Resolver, ResolveProperty, Query, Context } from "@nestjs/graphql"
import { DBService } from "../../prisma/DB.service"
>>>>>>> Add login mutation:src/modules/Homepage/homepage.resolver.ts

export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  JustAdded = "Just added",
  RecentlyViewed = "Recently viewed",
}

<<<<<<< HEAD:src/modules/Homepage/services/homepage.service.ts
@Injectable()
export class HomepageService {
  constructor(private readonly db: DBService) {}

  async getHomepageSections() {
    const productRails = await this.db.query.homepageProductRails(
=======
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
>>>>>>> Add login mutation:src/modules/Homepage/homepage.resolver.ts
      {},
      `{
        name
      }`
    )

    const sections: any = [
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
<<<<<<< HEAD:src/modules/Homepage/services/homepage.service.ts
        title: SectionTitle.RecentlyViewed
=======
        title: SectionTitle[SectionTitle.RecentlyViewed]
>>>>>>> Add login mutation:src/modules/Homepage/homepage.resolver.ts
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
