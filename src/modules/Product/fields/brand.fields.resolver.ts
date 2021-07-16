import { Select } from "@app/decorators/select.decorator"
import { PrismaService } from "@modules/Prisma/prisma.service"
import { ProductService } from "@modules/Product/services/product.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"

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
