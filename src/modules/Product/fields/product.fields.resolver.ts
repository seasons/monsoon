import { Resolver, Parent, ResolveProperty } from "@nestjs/graphql"
import { ProductService } from "../services/product.service"
import { Customer } from "../../../nest_decorators"

@Resolver("Product")
export class ProductFieldsResolver {
  constructor(private readonly productService: ProductService) {}

  @ResolveProperty()
  async isSaved(@Parent() parent, @Customer() customer) {
    if (!customer) return false

    return this.productService.isSaved(parent, customer)
  }
}
