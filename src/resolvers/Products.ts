import { Context } from "../utils"

export const Products = {
  products: async (parent, args, ctx: Context, info) => {
    const queryOptions = await queryOptionsForProducts(args, ctx)
    return await ctx.db.query.products({ ...args, ...queryOptions }, info)
  },

  productsConnection: async (parent, args, ctx: Context, info) => {
    const queryOptions = await queryOptionsForProducts(args, ctx)
    return await ctx.db.query.productsConnection(
      { ...args, ...queryOptions },
      info
    )
  },
}

const queryOptionsForProducts = async (args, ctx) => {
  const category = args.category || "all"
  const orderBy = args.orderBy || "createdAt_DESC"
  const sizes = args.sizes || []
  // Add filtering by sizes in query
  const where = args.where || {}
  if (sizes && sizes.length > 0) {
    // where.variants_some = { size_in: sizes }
  }

  // If client wants to sort by name, we will assume that they
  // want to sort by brand name as well
  if (orderBy.includes("name_")) {
    return await productsAlphabetically(ctx, category, orderBy, sizes)
  }

  const filters = await filtersForCategory(ctx, args)

  return {
    orderBy,
    where,
    ...filters,
  }
}

const filtersForCategory = async (ctx, args) => {
  if (args.category && args.category !== "all") {
    const category = await ctx.prisma.category({ slug: args.category })
    const children = await ctx.prisma
      .category({ slug: args.category })
      .children()

    return children.length > 0
      ? {
          where: {
            ...args.where,
            OR: children.map(({ slug }) => ({ category: { slug } })),
          },
        }
      : {
          where: {
            ...args.where,
            category: { slug: category.slug },
          },
        }
  }
  return {}
}

const productsAlphabetically = async (
  ctx: Context,
  category: string,
  orderBy: string,
  sizes: [string]
) => {
  const brands = await ctx.db.query.brands(
    { orderBy },
    `
      {
        name
        products(
          orderBy: name_ASC, 
          where: {
            ${category !== "all" ? `category: { slug: "${category}" },` : ""}
            status: Available,
            variants_some: { size_in: [${sizes}] }
          }
        ) {
          id
          name
          description
          images
          modelSize
          modelHeight
          externalURL
          tags
          retailPrice
          status
          createdAt
          updatedAt
          brand {
            id
            name
          }
          variants {
            id
            size
            total
            reservable
            nonReservable
            reserved
          }
        }
      }
      `
  )
  const products = brands.map(b => b.products).flat()
  return products
}
