import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

import { Customer } from "@app/nest_decorators"
import { ProductService } from "@modules/Product/services/product.service"

@Resolver("Product")
export class ProductFieldsResolver {
  constructor(private readonly productService: ProductService) {}

  @ResolveField()
  async isSaved(@Parent() product, @Customer() customer) {
    return this.productService.isSaved(product, customer)
  }
}
