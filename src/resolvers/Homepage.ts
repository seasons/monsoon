import { Context } from "../utils"
 
export const HomepageResult = {
  __resolveType(obj, _context, _info) {
    if (obj.brand || obj.colorway) {
      return "Product"
    }

    if(obj.website){
      return 'Category';
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
          const collections = await ctx.prisma.collectionGroup({slug: 'homepage-1'}).collections()
          return collections
        }
      },
      {
        type: "Products",
        __typename: "HomepageSection",
        title: "Just added",
        results: async (args, ctx: Context, info) => {
          const newProducts = await ctx.db.query.products({
            ...args,
            orderBy: 'createdAt_ASC',
            first: 6
          }, `{
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
          }`)
      
          return newProducts
        }
        
      },
      {
        type: "CollectionGroups",
        __typename: "HomepageSection",
        title: "Featured collection",
        results: async (args, ctx: Context, info) => {
          const collections = await ctx.prisma.collectionGroup({slug: 'homepage-2'}).collections()
          return collections
        }
      },
      {
        __typename: "HomepageSection",
        title: "Our latest picks",
        type: "HomepageProductRails",
        results:  async (args, ctx: Context, info) => {
          const productRail = await ctx.db.query.homepageProductRail(
            {...args, where: { slug: "our-latest-picks" } },
            `{
              __typename
              products {
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
              }
              name
            }`
          )
          return productRail && productRail.products
        }
      },
    ],
  }
}
