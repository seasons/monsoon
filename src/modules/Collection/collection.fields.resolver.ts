import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { addFragmentToInfo } from "graphql-binding"

import { ProductService } from "../Product/services/product.service"

@Resolver("Collection")
export class CollectionFieldsResolver {
  constructor(
    private readonly productService: ProductService,
    private readonly prisma: PrismaService
  ) {}

  @ResolveField()
  async productsConnection(@Parent() collection, @Args() args, @Info() info) {
    const products = await this.prisma.client
      .collection({ id: collection.id })
      .products()
    const IDs = products?.map(p => p.id)

    const newArgs = Object.assign({}, args, { where: { id_in: IDs } })
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
