import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  JustAdded = "Just added",
  RecentlyViewed = "Recently viewed",
  Designers = "Designers",
}

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomepageSections(customer) {
    const productRails = await this.prisma.binding.query.homepageProductRails(
      {},
      `{
        name
      }`
    )

    const sections: any = [
      {
        type: "CollectionGroups",
        __typename: "HomepageSection",
        title: SectionTitle.FeaturedCollection,
      },
      {
        type: "Products",
        __typename: "HomepageSection",
        title: SectionTitle.JustAdded,
      },
      {
        type: "Brands",
        __typename: "HomepageSection",
        title: SectionTitle.Designers,
      },
    ]

    if (customer) {
      sections.push({
        type: "Products",
        __typename: "HomepageSection",
        title: SectionTitle.RecentlyViewed,
      })
    }

    productRails.forEach((rail) => {
      sections.push({
        type: "HomepageProductRails",
        __typename: "HomepageSection",
        title: rail.name,
      })
    })

    return sections
  }
}
