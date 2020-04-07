import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { Customer, User } from "@app/nest_decorators"

import { BagService } from "../services/bag.service"
import { ProductRequestService } from "../services/productRequest.service"
import { ProductService } from "../services/product.service"

@Resolver()
export class ProductMutationsResolver {
  constructor(
    private readonly bagService: BagService,
    private readonly productRequestService: ProductRequestService,
    private readonly productService: ProductService
  ) {}

  @Mutation()
  async addProductRequest(@Args() { reason, url }, @User() user) {
    return await this.productRequestService.addProductRequest(reason, url, user)
  }

  @Mutation()
  async addToBag(@Args() { item }, @Customer() customer) {
    return await this.bagService.addToBag(item, customer)
  }

  @Mutation()
  async addViewedProduct(@Args() { item }, @Customer() customer) {
    return await this.productService.addViewedProduct(item, customer)
  }

  @Mutation()
  async saveProduct(
    @Args() { item, save = false },
    @Info() info,
    @Customer() customer
  ) {
    return await this.productService.saveProduct(item, save, info, customer)
  }

  @Mutation()
  async removeFromBag(@Args() { item, saved }, @Customer() customer) {
    return await this.bagService.removeFromBag(item, saved, customer)
  }

  @Mutation()
  async checkItemsAvailability(@Args() { items }, @Customer() customer) {
    return await this.productService.checkItemsAvailability(items, customer)
  }
}
