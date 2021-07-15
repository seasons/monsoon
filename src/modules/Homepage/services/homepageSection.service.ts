import {
  IMGIX_BASE,
  ImageService,
} from "@app/modules/Image/services/image.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma1/prisma.service"

import { SectionTitle } from "./homepage.service"

const ProductSelect = {
  id: true,
  slug: true,
  name: true,
  retailPrice: true,
  images: { select: { id: true, url: true } },
  brand: { select: { id: true, name: true } },
  variants: {
    select: {
      id: true,
      reservable: true,
      internalSize: {
        select: {
          top: { select: { letter: true } },
          bottom: { select: { type: true, value: true } },
          productType: true,
          display: true,
        },
      },
    },
  },
  color: { select: { name: true } },
}

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
      const _products = await this.prisma.client2.product.findMany({
        where: {
          AND: [
            { tags: { some: { name: tagData.tagName } } },
            { status: "Available" },
          ],
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: ProductSelect,
      })
      return this.prisma.sanitizePayload(_products, "Product")
    }

    switch (sectionTitle) {
      case SectionTitle.RecentlyViewed:
        if (!customerId) {
          return []
        }
        const _viewedProducts = await this.prisma.client2.recentlyViewedProduct.findMany(
          {
            where: { customer: { id: customerId } },
            orderBy: { updatedAt: "desc" },
            take: 10,
            select: { updatedAt: true, product: { select: ProductSelect } },
          }
        )
        const viewedProducts = this.prisma.sanitizePayload(
          _viewedProducts,
          "RecentlyViewedProduct"
        )
        return viewedProducts.map(viewedProduct => viewedProduct.product)

      case SectionTitle.Designers:
        const brands = await this.prisma.client2.brand.findMany({
          ...args,
          orderBy: { name: "asc" },
          where: {
            slug: {
              in: [
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
          select: { id: true, name: true, since: true },
        })
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
        const categories = await this.prisma.client2.category.findMany({
          where: {
            slug: { in: categorySlugs },
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
        return null
    }
  }
}
