import { getUserId } from "../auth/utils"
import { Context } from "../utils"
import { ProductWhereInput } from "../prisma"

export const Query = {
  async me(parent, args, ctx: Context) {
    const { id } = await getUserId(ctx)
    return ctx.prisma.user({ id })
  },
  products: async (parent, args, ctx: Context, info) => {
    const result = await ctx.db.query.products(args, info)
    return result
  },
  collections: (parent, args, ctx: Context, info) =>
    ctx.db.query.collections(args, info),

  product: (parent, args, ctx: Context, info) =>
    ctx.db.query.product(args, info),

  productFunctions: (parent, args, ctx: Context, info) =>
    ctx.db.query.productFunctions(args, info),

  categories: (parent, args, ctx: Context, info) =>
    ctx.db.query.categories(args, info),

  homepage: () => {
    return {
      "sections": [
        {
          "type": "Hero",
          "results": [
            { "id": "1", "heroImageURL": "https://i.pinimg.com/564x/ef/84/64/ef84647415e51db15a87993393aa8fe2.jpg" },
            { "id": "2", "heroImageURL": "https://i.pinimg.com/564x/f5/ba/30/f5ba30d71615c639199887f5e7cb2608.jpg" },
            { "id": "3", "heroImageURL": "https://i.pinimg.com/564x/9e/de/54/9ede54d2e658c7b73c49f0c7051f0f3f.jpg" },
            { "id": "4", "heroImageURL": "https://i.pinimg.com/564x/d8/ad/60/d8ad6000717d71e36fb828bfc1a64432.jpg" },
            { "id": "5", "heroImageURL": "https://i.pinimg.com/564x/1e/ac/c1/1eacc1e8b6d30435c88cf0ef5a58a7de.jpg" }
          ]
        },
        {
          "title:": "Just added",
          "type": "Products",
          "results": [ 
            {
              "images": [ {
                "imageUrl":
                  "https://dl.airtable.com/.attachments/59b317e57d55a6c8ee624694e3f3c641/6b9f475f/ScreenShot2019-09-26at9.11.53PM.png",
              }
              ],
              "color": {
                "name": "White & Red"
              },
              "name": "Heart Patch Hoodie",
              "brand": {
                "name": "Comme des Garcons"
              },
              "retailPrice": "270",
              "id": "ck21bpou600ww07665e7cyexr",
            },
            {
              "images": [
                {
                  "imageUrl":
                  "https://media.endclothing.com/media/catalog/product/1/1/11-09-2019_aimeleondore_distressedpopoverhoody_royaltypurple_ald-ch004-pr_th_m1.jpg",
                }
              ],
              "name": "Distressed Popover Hoodie",
              "brand": {
                "name": "Aimé Leon"
              },
              "color": {
                "name": "White & Red"
              },
              "retailPrice": "255",
              "id": "ck1do0tft00y20754vnf7l9cb",
            },
          ]
        },
        {
          "title:": "Featured brands",
          "type": "Brands",
          "results": [ 
              { 
                "id":"ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/5c9d13d7f3dda4fdd94e5d0a9217dd1e/f18da935/A-Cold-Wall-Logo.jpg"
                },
                "brandCode": "ACWL"
              },
              {
                "id":"ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/6fb6ff5d1eec5a217274f334f5183b94/96d55c51/acne-stockists.jpg"
                },
                "brandCode": "ACNE"
              },
              {
                "id": "ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/3cec4b0ce5a7e53f5224c023fea03ed4/d0a99052/acronym-stockists.jpg"
                },
                "brandCode": "ACRN"
              },
              { 
                "id":"ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/5c9d13d7f3dda4fdd94e5d0a9217dd1e/f18da935/A-Cold-Wall-Logo.jpg"
                },
                "brandCode": "ACWL"
              },
              {
                "id":"ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/6fb6ff5d1eec5a217274f334f5183b94/96d55c51/acne-stockists.jpg"
                },
                "brandCode": "ACNE"
              },
              {
                "id": "ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/3cec4b0ce5a7e53f5224c023fea03ed4/d0a99052/acronym-stockists.jpg"
                },
                "brandCode": "ACRN"
              },
              { 
                "id":"ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/5c9d13d7f3dda4fdd94e5d0a9217dd1e/f18da935/A-Cold-Wall-Logo.jpg"
                },
                "brandCode": "ACWL"
              },
              {
                "id":"ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/6fb6ff5d1eec5a217274f334f5183b94/96d55c51/acne-stockists.jpg"
                },
                "brandCode": "ACNE"
              },
              {
                "id": "ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/3cec4b0ce5a7e53f5224c023fea03ed4/d0a99052/acronym-stockists.jpg"
                },
                "brandCode": "ACRN"
              },
              { 
                "id":"ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/5c9d13d7f3dda4fdd94e5d0a9217dd1e/f18da935/A-Cold-Wall-Logo.jpg"
                },
                "brandCode": "ACWL"
              },
              {
                "id":"ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/6fb6ff5d1eec5a217274f334f5183b94/96d55c51/acne-stockists.jpg"
                },
                "brandCode": "ACNE"
              },
              {
                "id": "ck1dnzs9q004j0754n8ih3xdm",
                "image": {
                  "url":"https://dl.airtable.com/.attachments/3cec4b0ce5a7e53f5224c023fea03ed4/d0a99052/acronym-stockists.jpg"
                },
                "brandCode": "ACRN"
              }
          ]
        },
        {
          "title:": "Our latest picks",
          "type": "Products",
          "results": [ 
            {
              "images": [ {
                "imageUrl":
                  "https://dl.airtable.com/.attachments/59b317e57d55a6c8ee624694e3f3c641/6b9f475f/ScreenShot2019-09-26at9.11.53PM.png",
              }
              ],
              "color": {
                "name": "White & Red"
              },
              "name": "Heart Patch Hoodie",
              "brand": {
                "name": "Comme des Garcons"
              },
              "retailPrice": "270",
              "id": "ck21bpou600ww07665e7cyexr",
            },
            {
              "images": [
                {
                  "imageUrl":
                  "https://media.endclothing.com/media/catalog/product/1/1/11-09-2019_aimeleondore_distressedpopoverhoody_royaltypurple_ald-ch004-pr_th_m1.jpg",
                }
              ],
              "name": "Distressed Popover Hoodie",
              "brand": {
                "name": "Aimé Leon"
              },
              "color": {
                "name": "White & Red"
              },
              "retailPrice": "255",
              "id": "ck1do0tft00y20754vnf7l9cb",
            },
          ]
        },
      ] 
    }
  }
}
