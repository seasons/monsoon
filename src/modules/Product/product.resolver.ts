import { Query, Resolver, ResolveProperty, Args, Info, Context, Parent } from "@nestjs/graphql"
import { ProductService } from "./product.service"
import { DBService } from "../../prisma/DB.service"
import { prisma } from "../../prisma"

@Resolver("Product")
export class ProductResolver {
  constructor(
    private readonly db: DBService,
    private readonly productService: ProductService
  ) {}

  @Query()
  async products(@Args() args, @Info() info) {
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
      return await this.productService.productsAlphabetically(this.db, category, orderBy, sizes)
    }

    if (args.category && args.category !== "all") {
      const category = await prisma.category({ slug: args.category })
      const children = await prisma
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
      const products = await this.db.query.products(
        { first, skip, orderBy, where, ...filter },
        info
      )
      return products
    }

    const result = await this.db.query.products(
      { ...args, orderBy, where },
      info
    )
    return result
  }

  @Query()
  async product(@Args() args, @Info() info) {
    return await this.db.query.product(args, info)
  }
}
