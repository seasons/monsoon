import { Context } from "../utils"
import { getCustomerFromContext, getUserFromContext } from "../auth/utils"

// FIXME: This is being used because currently info is lacking the __typename, add __typename to info
const ProductFragment = `
{
  __typename
  id
  slug
  images
  name
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
  retailPrice
}
`

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
  // console.log("ABOUT TO MAKE FEEDBACK")
  // const user = await getUserFromContext(ctx)
  // const items = [
  //   "ck7z06yy80ne60724ex76we5n",
  //   "ck7z027rb0eka072417wdwsjn",
  //   "ck7z02yg90fza0724s4jbnhhc",
  // ]
  // const variants = await Promise.all(
  //   items.map(async item => {
  //     // const variant = this.prisma.client.productVariant({ id: item })
  //     return {
  //       id: await ctx.prisma.productVariant({ id: item }).id(),
  //       name: await ctx.prisma.productVariant({ id: item }).product().name(),
  //       retailPrice: await ctx.prisma.productVariant({ id: item }).product().retailPrice(),
  //     }
  //   })
  // )
  // console.log("VARIANTS:", variants)
  // const reservationFeedback = await ctx.prisma.createReservationFeedback({
  //   feedbacks: {
  //     create: variants.map(variant => ({
  //       isCompleted: false,
  //       questions: {
  //         create: [
  //           {
  //             question: `How many times did you wear this ${variant.name}?`,
  //             options: { set: ["More than 6 times", "3-5 times", "1-2 times", "0 times"] },
  //             type: "MultipleChoice",
  //           },
  //           {
  //             question: `Would you buy it at retail for $${variant.retailPrice}?`,
  //             options: { set: ["Would buy at a discount", "Buy below retail", "Buy at retail", "Would only rent"] },
  //             type: "MultipleChoice",
  //           },
  //           {
  //             question: `Did it fit as expected?`,
  //             options: { set: ["Fit too big", "Fit true to size", "Ran small", "Didn’t fit at all"] },
  //             type: "MultipleChoice",
  //           },
  //         ]
  //       },
  //       variant: { connect: { id: variant.id } }
  //     })),
  //   },
  //   user: {
  //     connect: {
  //       id: user.id
  //     }
  //   },
  // })
  // console.log("MADE FEEDBACK:", reservationFeedback)
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
        results: async (args, ctx: Context, localInfo) => {
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
      results: async (args, ctx: Context, localInfo) => {
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
