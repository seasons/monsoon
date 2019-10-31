import { Context } from "../utils"
import { CollectionGroups } from "./CollectionGroups"

export const HomepageResult = {
  __resolveType(obj, _context, _info) {
    if (obj.brand || obj.colorway) {
      return "Product"
    }

    // FIXME: Add category
    // if(obj.website){
    //   return 'Category';
    // }

    if (obj.subTitle) {
      return "Collection"
    }

    if (obj.logo) {
      return "Brand"
    }

    return null
  },
}

export const Homepage = (parent, args, ctx: Context, info) => {
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
      {
        type: "Brands",
        __typename: "HomepageSection",
        title: "Featured brands",
        results: [
          {
            id: "ck298qbuu001l0791wskrkgq0",
            logo:
              "https://dl.airtable.com/.attachments/5c9d13d7f3dda4fdd94e5d0a9217dd1e/f18da935/A-Cold-Wall-Logo.jpg",
            brandCode: "ACWL",
          },
          {
            id: "ck298qc91002h0791nahpe0wm",
            logo:
              "https://dl.airtable.com/.attachments/6fb6ff5d1eec5a217274f334f5183b94/96d55c51/acne-stockists.jpg",
            brandCode: "ACNE",
          },
          {
            id: "ck298qcfh002o07916o65iwxg",
            logo:
              "https://dl.airtable.com/.attachments/3cec4b0ce5a7e53f5224c023fea03ed4/d0a99052/acronym-stockists.jpg",
            brandCode: "ACRN",
          },
          {
            id: "ck298qbuu001l0791wskrkgq0",
            logo:
              "https://dl.airtable.com/.attachments/5c9d13d7f3dda4fdd94e5d0a9217dd1e/f18da935/A-Cold-Wall-Logo.jpg",
            brandCode: "ACWL",
          },
          {
            id: "ck298qc91002h0791nahpe0wm",
            logo:
              "https://dl.airtable.com/.attachments/6fb6ff5d1eec5a217274f334f5183b94/96d55c51/acne-stockists.jpg",
            brandCode: "ACNE",
          },
          {
            id: "ck298qcfh002o07916o65iwxg",
            logo:
              "https://dl.airtable.com/.attachments/3cec4b0ce5a7e53f5224c023fea03ed4/d0a99052/acronym-stockists.jpg",
            brandCode: "ACRN",
          },
          {
            id: "ck298qbuu001l0791wskrkgq0",
            logo:
              "https://dl.airtable.com/.attachments/5c9d13d7f3dda4fdd94e5d0a9217dd1e/f18da935/A-Cold-Wall-Logo.jpg",
            brandCode: "ACWL",
          },
          {
            id: "ck298qc91002h0791nahpe0wm",
            logo:
              "https://dl.airtable.com/.attachments/6fb6ff5d1eec5a217274f334f5183b94/96d55c51/acne-stockists.jpg",
            brandCode: "ACNE",
          },
          {
            id: "ck298qcfh002o07916o65iwxg",
            logo:
              "https://dl.airtable.com/.attachments/3cec4b0ce5a7e53f5224c023fea03ed4/d0a99052/acronym-stockists.jpg",
            brandCode: "ACRN",
          },
          {
            id: "ck298qbuu001l0791wskrkgq0",
            logo:
              "https://dl.airtable.com/.attachments/5c9d13d7f3dda4fdd94e5d0a9217dd1e/f18da935/A-Cold-Wall-Logo.jpg",
            brandCode: "ACWL",
          },
          {
            id: "ck298qc91002h0791nahpe0wm",
            logo:
              "https://dl.airtable.com/.attachments/6fb6ff5d1eec5a217274f334f5183b94/96d55c51/acne-stockists.jpg",
            brandCode: "ACNE",
          },
          {
            id: "ck298qcfh002o07916o65iwxg",
            logo:
              "https://dl.airtable.com/.attachments/3cec4b0ce5a7e53f5224c023fea03ed4/d0a99052/acronym-stockists.jpg",
            brandCode: "ACRN",
          },
        ],
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
