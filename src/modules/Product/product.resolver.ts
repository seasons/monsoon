import { Query, Resolver, Args, Info, Context } from "@nestjs/graphql"
import { PrismaService } from "../../prisma/prisma.service"
import { ProductService } from "./product.service"

@Resolver("Product")
export class ProductResolver {
  constructor(private readonly prisma: PrismaService, private readonly productService: ProductService) {}

  @Query()
  async products(@Args() args, @Info() info, @Context() ctx) {
    const category = args.category || "all"
    const orderBy = args.orderBy || "createdAt_DESC"
    const sizes = args.sizes || []
    // Add filtering by sizes in query
    const where = args.where || {}
    if (sizes && sizes.length > 0) {
      where.variants_some = { size_in: sizes }
    }

    // If client wants to sort by name, we will assume that they
    // want to sort by brand name as well
    if (orderBy.includes("name_")) {
      return await this.productService.productsAlphabetically(ctx, category, orderBy, sizes)
    }

    if (args.category && args.category !== "all") {
      const category = await ctx.prisma.category({ slug: args.category })
      const children = await ctx.prisma
        .category({ slug: args.category })
        .children()

      const filter =
        children.length > 0
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
      const { first, skip } = args
      const products = await ctx.db.query.products(
        { first, skip, orderBy, where, ...filter },
        info
      )
      return products
    }

    const result = await ctx.db.query.products(
      { ...args, orderBy, where },
      info
    )
    return result
  }

  @Query()
  async product(@Args() args, @Info() info) {
    return await this.prisma.query.product(args, info)
  }
}
