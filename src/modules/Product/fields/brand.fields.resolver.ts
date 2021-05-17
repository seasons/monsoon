import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { addFragmentToInfo } from "graphql-binding"

import { ProductService } from "../services/product.service"

@Resolver("Brand")
export class BrandFieldsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService
  ) {}

  @ResolveField()
  async productsConnection(@Parent() brand, @Args() args, @Info() info) {
    const brandSlug = await this.prisma.client.brand({ id: brand.id }).slug()
    const newArgs = Object.assign({}, args, {
      brand: brandSlug,
    })
    return await this.productService.getProductsConnection(
      newArgs,
      addFragmentToInfo(
        info,
        // for computed fields
        `fragment EnsureId on ProductConnection { edges { node { id } } }`
      )
    )
  }
}
