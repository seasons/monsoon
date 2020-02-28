import { Context } from "../utils"
import { getCustomerFromContext } from "../auth/utils"

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

export const HomepageResult = {
  __resolveType(obj, _context, _info) {
    if (obj.brand || obj.colorway) {
      return "Product"
    } else if (obj.since) {
      return "Brand"
    } else if (obj.subTitle) {
      return "Collection"
    } else if (obj.name) {
      return "HomepageProductRail"
    } else {
      return null
    }
  },
}

export const Homepage = async (parent, args, ctx: Context, info) => {
  let customer
  try {
    customer = await getCustomerFromContext(ctx)
  } catch (error) {
    console.log("Customer is not logged in", error)
  }
  const productRails = await ctx.db.query.homepageProductRails(
    {},
    `{
      __typename
      id
      name
      products {
        id
      }
    }`
  )

  const homepageSections = {
    sections: [
      {
        type: "CollectionGroups",
        __typename: "HomepageSection",
        title: "Featured collection",
        results: async (args, ctx: Context, info) => {
          const collections = await ctx.prisma
            .collectionGroup({ slug: "homepage-1" })
            .collections()
          return collections
        },
      },
      {
        type: "Products",
        __typename: "HomepageSection",
        title: "Just added",
        results: async (args, ctx: Context, info) => {
          const newProducts = await ctx.db.query.products(
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
        },
      },
      {
        type: "Brands",
        __typename: "HomepageSection",
        title: "Designers",
        results: async (args, ctx: Context, info) => {
          const brands = await ctx.db.query.brands(
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
        },
      },
    ],
  }

  if (customer) {
    homepageSections.sections.push({
      type: "Products",
      __typename: "HomepageSection",
      title: "Recently viewed",
      results: async (args, ctx: Context, info) => {
        //
        const viewedProducts = await ctx.db.query.recentlyViewedProducts(
          {
            where: { customer: { id: customer.id } },
            orderBy: "updatedAt_DESC",
            limit: 10,
          },
          `{ 
            updatedAt
            product ${ProductFragment} 
          }`
        )
        return viewedProducts.map(viewedProduct => viewedProduct.product)
      },
    })
  }

  productRails.forEach(rail => {
    homepageSections.sections.push({
      type: "HomepageProductRails",
      __typename: "HomepageSection",
      title: rail.name,
      results: async () => {
        return await ctx.db.query.products(
          {
            where: {
              id_in: rail.products.map(product => {
                return product.id
              }),
            },
          },
          ProductFragment
        )
      },
    })
  })
  return homepageSections
}
