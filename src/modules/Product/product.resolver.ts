import { Query, Resolver, ResolveProperty, Args, Info, Context, Parent, Mutation } from "@nestjs/graphql"
import { ProductService } from "./product.service"
import { DBService } from "../../prisma/DB.service"
import { prisma } from "../../prisma"

@Resolver("Product")
export class ProductResolver {
  constructor(
    private readonly db: DBService,
    private readonly productService: ProductService
  ) {}

  @ResolveProperty()
  async color(@Parent() product) {
    return await prisma
      .product({ id: product.id })
      .color()
  }

  @ResolveProperty()
  async brand(@Parent() product) {
    return await prisma
      .product({ id: product.id })
      .brand()
  }

  @ResolveProperty()
  async category(@Parent() product) {
    return await prisma
      .product({ id: product.id })
      .category()
  }

  @ResolveProperty()
  async secondaryColor(@Parent() product) {
    return await prisma
      .product({ id: product.id })
      .secondaryColor()
  }

  @ResolveProperty()
  async functions(@Parent() product) {
    return await prisma
      .product({ id: product.id })
      .functions()
  }

  @ResolveProperty()
  async variants(@Parent() product) {
    return await prisma
      .product({ id: product.id })
      .variants()
  }

  @Query()
  async products(@Args() args, @Info() info) {
    return await this.productService.getProducts(args, info)
  }

  @Query()
  async product(@Args() args, @Info() info) {
    return await this.db.query.product(args, info)
  }

  @Query()
  async productRequests(@Args() args, @Info() info) {
    return await this.db.query.productRequests(args, info)
  }

  @Query()
  async productFunctions(@Args() args, @Info() info) {
    return await this.db.query.productFunctions(args, info)
  }

  @Mutation()
  async addViewedProduct(@Args() { item }, @Context() ctx) {
    return await this.productService.addViewedProduct(item, ctx)
  }
}
