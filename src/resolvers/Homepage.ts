import { Context } from "../utils"
import { getAllProducts } from "../airtable/utils";
 
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
          const collections = await ctx.prisma.collectionGroup({slug: 'featured-collections'}).collections()
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
        __typename: "HomepageSection",
        title: "Our latest picks",
        type: "Products",
        results: [
          {
            images: [
              {
                imageUrl:
                  "https://dl.airtable.com/.attachments/59b317e57d55a6c8ee624694e3f3c641/6b9f475f/ScreenShot2019-09-26at9.11.53PM.png",
              },
            ],
            color: {
              name: "White & Red",
            },
            name: "Heart Patch Hoodie",
            brand: {
              name: "Comme des Garcons",
            },
            retailPrice: "270",
            id: "ck21bpou600ww07665e7cyexr",
          },
          {
            images: [
              {
                imageUrl:
                  "https://media.endclothing.com/media/catalog/product/1/1/11-09-2019_aimeleondore_distressedpopoverhoody_royaltypurple_ald-ch004-pr_th_m1.jpg",
              },
            ],
            name: "Distressed Popover Hoodie",
            brand: {
              name: "Aimé Leon",
            },
            color: {
              name: "White & Red",
            },
            retailPrice: "255",
            id: "ck1do0tft00y20754vnf7l9cb",
          },
        ],
      },
    ],
  }
}
