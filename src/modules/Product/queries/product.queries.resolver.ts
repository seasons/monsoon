import { Args, Context, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma/prisma.service"
import { addFragmentToInfo } from "graphql-binding"

import { ProductService } from "../services/product.service"

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
    return await this.productService.getProducts(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on Product { id }`
      )
    )
  }

  @Query()
  async productsConnection(@Args() args, @Info() info) {
    return await this.productService.getProductsConnection(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on ProductConnection { edges { node { id } } }`
      )
    )
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
  async productMaterialCategories(@Args() args, @Info() info) {
    return await this.prisma.binding.query.productMaterialCategories(args, info)
  }

  @Query()
  async productModels(@Args() args, @Info() info) {
    return await this.prisma.binding.query.productModels(args, info)
  }

  @Query()
  async productVariant(@Args() args, @Info() info, @Context() ctx) {
    return await this.prisma.binding.query.productVariant(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on ProductVariant { id }`
      )
    )
  }

  @Query()
  async physicalProduct(@Args() args, @Info() info) {
    return await this.prisma.binding.query.physicalProduct(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on PhysicalProduct { id }`
      )
    )
  }

  @Query()
  async physicalProducts(@Args() args, @Info() info) {
    return await this.prisma.binding.query.physicalProducts(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on PhysicalProduct { id }`
      )
    )
  }

  @Query()
  async categories(@Args() args, @Info() info) {
    return await this.prisma.binding.query.categories(args, info)
  }

  @Query()
  async categoriesConnection(@Args() args, @Info() info) {
    return await this.prisma.binding.query.categoriesConnection(args, info)
  }

  @Query()
  async colors(@Args() args, @Info() info) {
    return await this.prisma.binding.query.colors(args, info)
  }

  @Query()
  async generatedVariantSKUs(@Args() args, @Info() info) {
    console.log("ARGS:", args)
    return await this.productService.getGeneratedVariantSKUs(args)
  }

  @Query()
  async generatedSeasonsUIDs(@Args() { input }, @Info() info) {
    console.log("INPUT:", input)
    const { brandID, colorCode, sizes } = input
    return await this.productService.getGeneratedSeasonsUIDs({
      brandID,
      colorCode,
      sizes,
    })
  }

  @Query()
  async tags(@Args() args, @Info() info) {
    return await this.prisma.binding.query.tags(args, info)
  }

  @Query()
  async warehouseLocations(@Args() args, @Info() info) {
    return await this.prisma.binding.query.warehouseLocations(args, info)
  }
}
