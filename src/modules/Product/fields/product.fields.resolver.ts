import { Resolver, Parent, ResolveField } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"
import { Customer } from "../../../nest_decorators"

@Resolver("Product")
export class ProductFieldsResolver {
  constructor(private readonly productService: ProductService) {}

  @ResolveField()
  async isSaved(@Parent() product, @Customer() customer) {
    return this.productService.isSaved(product, customer)
  }
}
