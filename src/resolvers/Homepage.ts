import { Context } from "../utils"

export const HomepageResult = {
  __resolveType(obj, _context, _info) {
    if (obj.brand || obj.colorway) {
      return "Product"
    }

    // FIXME: Add category
    // if(obj.website){
    //   return 'Category';
    // }

    if (obj.logo) {
      return "Brand"
    }

    if (obj.heroImageURL) {
      return "Hero"
    }

    return null
  },
}

export const Homepage = (parent, args, ctx: Context, info) => {
  return {
    sections: [
      {
        type: "Hero",
        __typename: "HomepageSection",
        title: "Featured collection",
        results: [
          {
            id: "1",
            heroImageURL:
              "https://i.pinimg.com/564x/ef/84/64/ef84647415e51db15a87993393aa8fe2.jpg",
          },
          {
            id: "2",
            heroImageURL:
              "https://i.pinimg.com/564x/f5/ba/30/f5ba30d71615c639199887f5e7cb2608.jpg",
          },
          {
            id: "3",
            heroImageURL:
              "https://i.pinimg.com/564x/9e/de/54/9ede54d2e658c7b73c49f0c7051f0f3f.jpg",
          },
          {
            id: "4",
            heroImageURL:
              "https://i.pinimg.com/564x/d8/ad/60/d8ad6000717d71e36fb828bfc1a64432.jpg",
          },
          {
            id: "5",
            heroImageURL:
              "https://i.pinimg.com/564x/1e/ac/c1/1eacc1e8b6d30435c88cf0ef5a58a7de.jpg",
          },
        ],
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
