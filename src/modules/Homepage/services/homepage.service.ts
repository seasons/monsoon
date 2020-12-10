import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  RecentlyViewed = "Recently viewed",
  Designers = "Designers",
  Categories = "Browse by style",
  HolidayRail = "Holiday heat",
}

interface Section {
  type: string
  __typename: string
  title: string
  tagData?: {
    description?: string
    tagName: string
  }
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

    const sections: Section[] = [
      {
        type: "CollectionGroups",
        __typename: "HomepageSection",
        title: SectionTitle.FeaturedCollection,
      },
      {
        type: "Categories",
        __typename: "HomepageSection",
        title: SectionTitle.Categories,
      },
      {
        type: "ProductsByTag",
        __typename: "HomepageSection",
        title: SectionTitle.HolidayRail,
        tagData: {
          tagName: "Holiday",
          description:
            "Staying in for the holidays? Get cozy, flex on your roommates, 2020 is almost over — you earned it.",
        },
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

    productRails.forEach(rail => {
      sections.push({
        type: "HomepageProductRails",
        __typename: "HomepageSection",
        title: rail.name,
      })
    })

    return sections
  }
}
