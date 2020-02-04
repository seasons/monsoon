import { Context } from "../utils"

export const HomepageResult = {
  __resolveType(obj, _context, _info) {
    if (obj.brand || obj.colorway) {
      return "Product"
    }

    if (obj.website) {
      return "Category"
    }

    if (obj.subTitle) {
      return "Collection"
    }

    if (obj.logo) {
      return "Brand"
    }

    return null
  },
}

export const Homepage = async (parent, args, ctx: Context, info) => {
  return {
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
            `{
            __typename
            id
            images
            brand {
              name
            }
            name
            color {
              name
            }
            retailPrice
          }`
          )

          return newProducts
        },
      },
    ],
  }
}
