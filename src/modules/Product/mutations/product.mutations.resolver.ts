import { Customer, User } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"

import { BagService } from "../services/bag.service"
import { ProductService } from "../services/product.service"
import { ProductRequestService } from "../services/productRequest.service"

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
  async upsertProduct(@Args() { input }, @User() user, @Select() select) {
    return await this.productService.deepUpsertProduct(input)
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
  async removeFromBag(
    @Args() { item, saved, customer: passedCustomerID },
    @Customer() customer
  ) {
    return await this.bagService.removeFromBag(
      item,
      saved,
      !!passedCustomerID ? { id: passedCustomerID } : customer
    )
  }

  @Mutation()
  async checkItemsAvailability(@Args() { items }, @Customer() customer) {
    return await this.productService.checkItemsAvailability(items, customer)
  }

  @Mutation()
  async updateProduct(@Args() { where, data }, @Info() info, @Select() select) {
    return await this.productService.updateProduct({ where, data, info })
  }

  @Mutation()
  async publishProducts(@Args() { productIDs }) {
    return await this.productService.publishProducts(productIDs)
  }
}
