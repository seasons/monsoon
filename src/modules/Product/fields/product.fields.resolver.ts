import { Resolver, Parent, Context, ResolveProperty } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"
import { DBService } from "../../../prisma/db.service"

@Resolver("Product")
export class ProductFieldsResolver {
  constructor(
    private readonly db: DBService,
    private readonly productService: ProductService
  ) {}

  @ResolveProperty()
  async isSaved(@Parent() parent, @Context() ctx) {
    return this.productService.isSaved(parent, ctx)
  }
}
