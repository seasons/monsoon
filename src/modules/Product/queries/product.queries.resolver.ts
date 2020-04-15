import { Args, Context, Info, Query, Resolver } from "@nestjs/graphql"

import { PrismaService } from "@prisma/prisma.service"
import { ProductService } from "../services/product.service"
import { addFragmentToInfo } from "graphql-binding"

@Resolver()
export class ProductQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService
  ) {}

  @Query()
  async product(@Args() args, @Info() info, @Context() ctx) {
    return await this.prisma.binding.query.product(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on Product { id }`
      )
    )
  }

  @Query()
  async products(@Args() args, @Info() info) {
    return await this.productService.getProducts(args, info)
  }

  @Query()
  async productsConnection(@Args() args, @Info() info) {
    return await this.productService.getProductsConnection(args, info)
  }

  @Query()
  async productRequests(@Args() args, @Info() info) {
    return await this.prisma.binding.query.productRequests(args, info)
  }

  @Query()
  async productFunctions(@Args() args, @Info() info) {
    return await this.prisma.binding.query.productFunctions(args, info)
  }

  @Query()
  async physicalProduct(@Args() args, @Info() info) {
    return await this.prisma.binding.query.physicalProduct(args, info)
  }

  @Query()
  async physicalProducts(@Args() args, @Info() info) {
    return await this.prisma.binding.query.physicalProducts(args, info)
  }

  @Query()
  async categories(@Args() args, @Info() info) {
    return await this.prisma.binding.query.categories(args, info)
  }

  @Query()
  async categoriesConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.categoriesConnection(args, info)
  }
}
