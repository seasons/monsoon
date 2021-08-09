import { Application } from "@app/decorators/application.decorator"
import { Select } from "@app/decorators/select.decorator"
import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { ProductService } from "../Product/services/product.service"

@Resolver("Collection")
export class CollectionFieldsResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly prisma: PrismaService
  ) {}

  @ResolveField()
  async productsConnection(
    @Parent() collection,
    @Args() args,
    @Application() application,
    @Select({
      withFragment: `fragment EnsureId on ProductConnection { edges { node { id } } }`,
    })
    select
  ) {
    const categoriesWithProducts = await this.prisma.client.collection.findUnique(
      {
        where: { id: collection.id },
        select: { products: { select: { id: true } } },
      }
    )
    const IDs = categoriesWithProducts?.products?.map(p => p.id)

    const newArgs = Object.assign({}, args, { where: { id_in: IDs } })
    return await this.productService.getProductsConnection(
      newArgs,
      select,
      application
    )
  }
}
