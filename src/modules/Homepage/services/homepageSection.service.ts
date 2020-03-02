import { Injectable } from "@nestjs/common"
import { DBService } from "../../../prisma/DB.service"
import { SectionTitle } from "./homepage.service"
import { PrismaClientService } from "../../../prisma/client.service"

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

@Injectable()
export class HomepageSectionService {
  constructor(
    private readonly db: DBService,
    private readonly prisma: PrismaClientService
  ) {}

  async getResultsForSection(sectionTitle: SectionTitle, args, user?) {
    switch (sectionTitle) {
      case SectionTitle.FeaturedCollection:
        const collections = await this.prisma.client
          .collectionGroup({ slug: "homepage-1" })
          .collections()
        return collections
      case SectionTitle.JustAdded:
        const newProducts = await this.db.query.products(
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
        const rails = await this.db.query.homepageProductRails(
          {
            where: {
              name: sectionTitle
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
