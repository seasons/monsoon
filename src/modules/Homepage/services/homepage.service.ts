import { Injectable } from "@nestjs/common"
import { DBService } from "../../../prisma/DB.service"

export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  JustAdded = "Just added",
  RecentlyViewed = "Recently viewed",
}

@Injectable()
export class HomepageService {
  constructor(private readonly db: DBService) {}

  async getHomepageSections() {
    const productRails = await this.db.query.homepageProductRails(
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
        title: SectionTitle.RecentlyViewed
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
