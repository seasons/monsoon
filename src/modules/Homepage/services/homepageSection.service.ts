import { Injectable } from "@nestjs/common"
import { SectionTitle } from "./homepage.service"
import { PrismaService } from "../../../prisma/prisma.service"

// FIXME: This is being used because currently info is lacking the __typename, add __typename to info
const ProductFragment = `
{
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
    reservable
    internalSize {
      top {
        letter
      }
      bottom {
        type
        value
      }
      productType
      display
    }
  }
  color {
    name
  }
  retailPrice
}
`

@Injectable()
export class HomepageSectionService {
  constructor(private readonly prisma: PrismaService) {}

  async getResultsForSection(sectionTitle: SectionTitle, args, customerId?) {
    switch (sectionTitle) {
      case SectionTitle.FeaturedCollection:
        const collections = await this.prisma.client
          .collectionGroup({ slug: "homepage-1" })
          .collections()
        return collections

      case SectionTitle.JustAdded:
        const newProducts = await this.prisma.binding.query.products(
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
        const viewedProducts = await this.prisma.binding.query.recentlyViewedProducts(
          {
            where: { customer: { id: customerId } },
            orderBy: "updatedAt_DESC",
            first: 10,
          },
          `{
            updatedAt
            product ${ProductFragment}
          }`
        )
        return viewedProducts.map(viewedProduct => viewedProduct.product)

      case SectionTitle.Designers:
        const brands = await this.prisma.binding.query.brands(
          {
            ...args,
            where: {
              slug_in: [
                "acne-studios",
                "stone-island",
                "stussy",
                "comme-des-garcons",
                "aime-leon-dore",
                "noah",
                "cavempt",
                "brain-dead",
                "john-elliot",
                "amiri",
                "prada",
                "craig-green",
                "dries-van-noten",
                "cactus-plant-flea-market",
                "ambush",
                "all-saints",
                "heron-preston",
                "saturdays-nyc",
                "y-3",
                "our-legacy",
              ],
            },
          },
          `{
            __typename
            id
            name
            since
          }`
        )
        return brands

      default:
        const rails = await this.prisma.binding.query.homepageProductRails(
          {
            where: {
              name: sectionTitle,
            },
          },
          `{
            products ${ProductFragment}
          }`
        )
        return Array.prototype.concat.apply(
          [],
          rails.map(rail => rail.products)
        )
    }
  }
}
