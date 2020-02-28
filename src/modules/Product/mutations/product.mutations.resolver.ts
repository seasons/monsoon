import { Resolver, Args, Context, Mutation } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"

@Resolver("Product")
export class ProductMutationsResolver {
  constructor(private readonly productService: ProductService) {}

  @Mutation()
  async addViewedProduct(@Args() { item }, @Context() ctx) {
    return await this.productService.addViewedProduct(item, ctx)
  }
}
