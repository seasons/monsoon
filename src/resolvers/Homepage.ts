import { Context } from "../utils"

// FIXME: This is being used because currently info is lacking the __typename, add __typename to info
const productFragment = `{
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
            productFragment
          )

          return newProducts
        },
      },
    ],
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
          productFragment
        )
      },
    })
  })
  return homepageSections
}
