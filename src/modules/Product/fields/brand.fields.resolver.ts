import { Application } from "@app/decorators/application.decorator"
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
  async productsConnection(
    @Parent() brand,
    @Args() args,
    @Select() select,
    @Application() application
  ) {
    let brandSlug = brand.slug
    if (!brandSlug) {
      brandSlug = (
        await this.prisma.client.brand.findUnique({
          where: { id: brand.id },
          select: { slug: true },
        })
      ).slug
    }
    const newArgs = Object.assign({}, args, {
      brand: brandSlug,
    })
    return await this.productService.getProductsConnection(
      newArgs,
      select,
      application
    )
  }

  @ResolveField()
  async products(
    @Parent() brand,
    @Select() select,
    @Application() application
  ) {
    let where = {}
    if (application === "flare" || application === "harvest") {
      where = {
        brand: {
          id: brand.id,
        },
        status: "Available",
      }
    } else {
      where = {
        brand: {
          id: brand.id,
        },
      }
    }
    return await this.prisma.client.product.findMany({
      where,
      select,
    })
  }
}
