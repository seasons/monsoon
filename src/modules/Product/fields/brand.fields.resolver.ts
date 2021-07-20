import { Select } from "@app/decorators/select.decorator"
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
  async productsConnection(@Parent() brand, @Args() args, @Select() select) {
    let brandSlug = brand.slug
    if (!brandSlug) {
      brandSlug = (
        await this.prisma.client2.brand.findUnique({
          where: { id: brand.id },
          select: { slug: true },
        })
      ).slug
    }
    const newArgs = Object.assign({}, args, {
      brand: brandSlug,
    })
    return await this.productService.getProductsConnection(newArgs, select)
  }
}
