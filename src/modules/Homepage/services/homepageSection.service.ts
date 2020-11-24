import { IMGIX_BASE } from "@app/modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

import { SectionTitle } from "./homepage.service"

// FIXME: This is being used because currently info is lacking the __typename, add __typename to info
const ProductFragment = `
{
  __typename
  id
  slug
  name
  retailPrice
  images {
    id
    url
  }
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

      case SectionTitle.RecentlyViewed:
        if (!customerId) {
          return []
        }
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
            orderBy: "name_ASC",
            where: {
              slug_in: [
                "acne-studios",
                "amiri",
                "auralee",
                "bode",
                "cactus-plant-flea-market",
                "casablanca",
                "cav-empt",
                "comme-des-garcons",
                "craig-green",
                "daily-paper",
                "deveaux",
                "dries-van-noten",
                "engineered-garments",
                "gucci",
                "heron-preston",
                "jacquemus",
                "john-elliott",
                "judy-turner",
                "kapital",
                "landlord",
                "martine-rose",
                "noah",
                "nanushka",
                "our-legacy",
                "palm-angels",
                "prada",
                "rhude",
                "sacai",
                "stone-island",
                "stussy",
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

      case SectionTitle.Categories:
        const categorySlugs = [
          "coats",
          "jackets",
          "hoodies-and-sweatshirts",
          "shirts",
          "pants",
          "tees",
        ]
        const categoryImages = {
          pants: "homepage-categories/Pants.jpg",
          "hoodies-and-sweatshirts": "homepage-categories/Hoodies.jpg",
          jackets: "homepage-categories/Jackets.jpg",
          coats: "homepage-categories/Coats.jpg",
          tees: "homepage-categories/Tees.jpg",
          shirts: "homepage-categories/Shirts.jpg",
        }
        const categories = await this.prisma.binding.query.categories({
          where: {
            slug_in: categorySlugs,
          },
        })
        return categories
          .map(category => ({
            ...category,
            __typename: "Category",
            name:
              category.slug === "hoodies-and-sweatshirts"
                ? "Hoodies"
                : category.name,
            image: [
              {
                url: IMGIX_BASE + categoryImages[category.slug],
              },
            ],
          }))
          .sort((catA, catB) => {
            const catAIdx = categorySlugs.findIndex(slug => slug === catA.slug)
            const catBIdx = categorySlugs.findIndex(slug => slug === catB.slug)
            return catAIdx - catBIdx
          })

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
