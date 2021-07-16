import { PrismaService } from "@modules/Prisma/prisma.service"
import { Injectable } from "@nestjs/common"

export enum SectionTitle {
  FeaturedCollection = "Featured collection",
  RecentlyViewed = "Recently viewed",
  Designers = "Designers",
  Categories = "Browse by style",
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
