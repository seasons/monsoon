import {
  IMGIX_BASE,
  ImageService,
} from "@app/modules/Image/services/image.service"
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly image: ImageService
  ) {}

  async getResultsForSection(
    sectionTitle: SectionTitle,
    tagData,
    args,
    customerId?
  ) {
    if (!!tagData?.tagName) {
      return await this.prisma.binding.query.products(
        {
          where: {
            AND: [
              { tags_some: { name: tagData.tagName } },
              { status: "Available" },
            ],
          },
          orderBy: "updatedAt_DESC",
          first: 10,
        },
        ProductFragment
      )
    }

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
          "hoodies",
          "jackets",
          "shirts",
          "pants",
          "tees",
          "sweatshirts",
          "shorts",
        ]
        const categoryImages = {
          pants: "homepage-categories/Pants.jpg",
          hoodies: "homepage-categories/Hoodies.jpg",
          jackets: "homepage-categories/Jackets.jpg",
          coats: "homepage-categories/Coats.jpg",
          tees: "homepage-categories/Tees.jpg",
          shirts: "homepage-categories/Shirts.jpg",
          sweatshirts: "homepage-categories/Sweatshirts.jpg",
          shorts: "homepage-categories/Shorts.jpg",
        }
        const categories = await this.prisma.binding.query.categories({
          where: {
            slug_in: categorySlugs,
          },
        })
        const categoriesWithImages = await Promise.all(
          categories.map(category => {
            const imageUrl = IMGIX_BASE + categoryImages[category.slug]
            return this.image
              .resizeImage(imageUrl, "Small", {})
              .then(imageUrl => ({
                ...category,
                __typename: "Category",
                image: [
                  {
                    url: imageUrl,
                  },
                ],
              }))
          })
        )
        return categoriesWithImages.sort((catA, catB) => {
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
