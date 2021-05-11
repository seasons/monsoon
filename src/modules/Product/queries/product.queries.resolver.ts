import * as util from "util"

import { Customer, User } from "@app/decorators"
import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { Product } from "@app/prisma/prisma.binding"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
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
  async product(
    @Args() { id, slug },
    @Info() info,
    @User() user,
    @Loader({
      params: {
        query: "products",
        formatWhere: keys => ({ slug_in: keys }),
        getKeys: a => [a.slug],
        infoFragment: `fragment EnsureId on Product { id }`,
      },
      includeInfo: true,
    })
    productBySlugLoader: PrismaDataLoader<Product>,
    @Loader({
      params: {
        query: "products",
        formatWhere: keys => ({ id_in: keys }),
        getKeys: a => [a.id],
        infoFragment: `fragment EnsureId on Product { id }`,
      },
      includeInfo: true,
    })
    productByIdLoader: PrismaDataLoader<Product>
  ) {
    const scope = !!user ? "PRIVATE" : "PUBLIC"
    info.cacheControl.setCacheHint({ maxAge: 600, scope })
    console.log(`run product resolver`)

    let prod
    if (!!slug) {
      prod = await productBySlugLoader.load(slug)
    } else if (!!id) {
      prod = await productByIdLoader.load(id)
    } else {
      throw new Error(`Expected slug or id in product resolver`)
    }

    return prod
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
    console.log(`run productsConnection resolver`)
    const result = await this.productService.getProductsConnection(
      args,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on ProductConnection { edges { node { id } } }`
      )
    )
    console.log(`products connection query done`)
    console.log(util.inspect(result, { depth: null }))
    return result
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
    console.log("run product variant connection resolver")
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
    console.log("run product variant resolver")
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
