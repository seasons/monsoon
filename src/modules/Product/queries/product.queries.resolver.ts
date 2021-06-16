import { Customer, User } from "@app/decorators"
import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"

import { ProductService } from "../services/product.service"

@Resolver()
export class ProductQueriesResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  @Query()
  async product(
    @Args() { where },
    @Info() info,
    @User() user,
    @Select() select
  ) {
    const scope = !!user ? "PRIVATE" : "PUBLIC"
    info.cacheControl.setCacheHint({ maxAge: 600, scope })

    return await this.queryUtils.resolveFindUnique({ where, select }, "Product")
  }

  @Query()
  async products(
    @Args() args,
    @Select({
      withFragment: `fragment EnsureId on Product { id }`,
    })
    select
  ) {
    return await this.productService.getProducts(args, select)
  }

  @Query()
  async productsConnection(
    @Args() args,
    @Select({
      withFragment: `fragment EnsureId on ProductConnection { edges { node { id } } }`,
    })
    select
  ) {
    return this.productService.getProductsConnection(args, select)
  }

  @Query()
  async productRequests(@FindManyArgs() args) {
    return await this.queryUtils.resolveFindMany(args, "ProductRequest")
  }

  @Query()
  async productFunctions(@FindManyArgs() args) {
    return await this.queryUtils.resolveFindMany(args, "ProductFunction")
  }

  @Query()
  async productMaterialCategories(@FindManyArgs() args) {
    return await this.queryUtils.resolveFindMany(
      args,
      "ProductMaterialCategory"
    )
  }

  @Query()
  async productModels(@FindManyArgs() args) {
    return await this.queryUtils.resolveFindMany(args, "ProductModel")
  }

  @Query()
  async productVariantsConnection(
    @Args() args,
    @Select({
      withFragment: `fragment EnsureId on ProductVariantConnection { edges { node { id } } }`,
    })
    select,
    @Customer() customer
  ) {
    if (args.personalizedForCurrentUser) {
      const products = await this.productService.availableProductVariantsConnectionForCustomer(
        customer.id,
        args,
        select
      )
      return products
    }

    return this.queryUtils.resolveConnection(
      { ...args, select },
      "ProductVariant"
    )
  }

  @Query()
  async productVariant(
    @Args() { where },
    @Select({ withFragment: `fragment EnsureId on ProductVariant { id }` })
    select
  ) {
    return this.queryUtils.resolveFindUnique(
      { where, select },
      "ProductVariant"
    )
  }

  @Query()
  async physicalProduct(
    @Args() { where },
    @Select({ withFragment: `fragment EnsureId on PhysicalProduct { id }` })
    select
  ) {
    return await this.queryUtils.resolveFindUnique(
      { where, select },
      "PhysicalProduct"
    )
  }

  @Query()
  async physicalProducts(@FindManyArgs() args) {
    return this.queryUtils.resolveFindMany(args, "PhysicalProduct")
  }

  @Query()
  async physicalProductsConnection(
    @Args() args,
    @Select({
      withFragment: `fragment EnsureId on PhysicalProductConnection { edges { node { id } } }`,
    })
    select
  ) {
    return this.queryUtils.resolveConnection(
      { ...args, select },
      "PhysicalProduct"
    )
  }

  @Query()
  async categories(@FindManyArgs() args) {
    return this.queryUtils.resolveFindMany(args, "Category")
  }

  @Query()
  async category(@Args() { where }, @Select() select) {
    return this.queryUtils.resolveFindUnique({ where, select }, "Category")
  }

  @Query()
  async categoriesConnection(@Args() args, @Select() select) {
    return this.queryUtils.resolveConnection({ ...args, select }, "Category")
  }

  @Query()
  async colors(@FindManyArgs() args) {
    return this.queryUtils.resolveFindMany(args, "Color")
  }

  @Query()
  async generatedVariantSKUs(@Args() args) {
    return this.productService.getGeneratedVariantSKUs(args)
  }

  @Query()
  async generatedSeasonsUIDs(@Args() { input }) {
    const { brandID, colorCode, sizes, productID } = input
    return this.productService.getGeneratedSeasonsUIDs({
      brandID,
      colorCode,
      sizes,
      productID,
    })
  }

  @Query()
  async tags(@FindManyArgs() args) {
    return this.queryUtils.resolveFindMany(args, "Tag")
  }

  @Query()
  async warehouseLocations(@FindManyArgs() args) {
    return this.queryUtils.resolveFindMany(args, "WarehouseLocation")
  }

  @Query()
  async surpriseProductVariants(@Customer() customer, @Select() select) {
    const products = this.productService.availableProductVariantsForCustomer(
      { id: customer.id },
      select
    )

    return products
  }

  @Query()
  async newestBrandProducts(@Args() args, @Select() select) {
    // Returns products from the most recent brand to be added
    return this.productService.newestBrandProducts(args, select)
  }
}
