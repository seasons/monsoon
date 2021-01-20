import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  RecentlyViewed = "Recently viewed",
  Designers = "Designers",
  Categories = "Browse by style",
  RevivalRail = "The revival collection",
}

interface Section {
  id: string
  type: string
  __typename: string
  title: string
  tagData?: {
    id: string
    description?: string
    tagName: string
  }
}

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomepageSections(customer) {
    const sections: Section[] = [
      {
        id: "categories",
        type: "Categories",
        __typename: "HomepageSection",
        title: SectionTitle.Categories,
      },
      {
        id: "productsByTag",
        type: "ProductsByTag",
        __typename: "HomepageSection",
        title: SectionTitle.RevivalRail,
        tagData: {
          id: "revivalCollectionID",
          tagName: "Revival Collection",
          description:
            "Revisit, rethink, restore ♻️ We’re starting off the new year by looking back into our own closet and encouraging you to do the same. Sometimes a fresh set of eyes on a garment pushed to the back shelf can spark a whole new look.\n\n2021 is the year of making use of what’s already been produced and for a bit of inspiration, we’re putting together a Revival Collection by breathing new life into some hidden gems within the Seasons catalog.",
        },
      },
      {
        id: "brands",
        type: "Brands",
        __typename: "HomepageSection",
        title: SectionTitle.Designers,
      },
    ]

    if (customer) {
      sections.push({
        id: "products",
        type: "Products",
        __typename: "HomepageSection",
        title: SectionTitle.RecentlyViewed,
      })
    }

    return sections
  }
}
