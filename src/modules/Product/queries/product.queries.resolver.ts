import { Customer } from "@app/decorators"
import { Args, Context, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaSelect } from "@paljs/plugins"
import { PrismaService } from "@prisma1/prisma.service"
import { addFragmentToInfo } from "graphql-binding"

import { ProductService } from "../services/product.service"

@Resolver()
export class ProductQueriesResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService
  ) {}

  @Query()
  async product(@Args() { where }, @Info() info, @Context() ctx) {
    const select = new PrismaSelect(info).value
    const data = await this.prisma.client2.product.findUnique({
      where,
      ...select,
    })

    return data
  }

  @Query()
  async products(@Args() { where }, @Info() info) {
    const select = new PrismaSelect(info).value
    const data = await this.prisma.client2.product.findMany({
      where,
      ...select,
    })

    return data

    // return await this.productService.getProducts(
    //   args,
    //   addFragmentToInfo(
    //     info,
    //     // for computed fields
    //     `fragment EnsureId on Product { id }`
    //   )
    // )
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
  async productVariantsConnection(
    @Args() args,
    @Info() info,
    @Customer() customer
  ) {
    if (args.personalizedForCurrentUser) {
      const products = await this.productService.availableProductVariantsConnectionForCustomer(
        customer.id,
        info,
        args
      )
      return products
    }

    return await this.prisma.binding.query.productVariantsConnection(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on ProductVariantConnection { edges { node { id } } }`
      )
    )
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
  async physicalProductsConnection(
    @Args() args,
    @Info() info,
    @Customer() customer
  ) {
    return await this.prisma.binding.query.physicalProductsConnection(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on PhysicalProductConnection { edges { node { id } } }`
      )
    )
  }

  @Query()
  async categories(@Args() args, @Info() info) {
    return await this.prisma.binding.query.categories(args, info)
  }

  @Query()
  async category(@Args() args, @Info() info) {
    return await this.prisma.binding.query.category(args, info)
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
    return await this.productService.getGeneratedVariantSKUs(args)
  }

  @Query()
  async generatedSeasonsUIDs(@Args() { input }, @Info() info) {
    const { brandID, colorCode, sizes, productID } = input
    return await this.productService.getGeneratedSeasonsUIDs({
      brandID,
      colorCode,
      sizes,
      productID,
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

  @Query()
  async surpriseProductVariants(@Customer() customer, @Info() info) {
    const products = await this.productService.availableProductVariantsForCustomer(
      { id: customer.id },
      info
    )

    return products
  }

  @Query()
  async newestBrandProducts(@Args() args, @Info() info) {
    // Returns products from the most recent brand to be added
    return await this.productService.newestBrandProducts(args, info)
  }
}
