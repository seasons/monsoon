import { Customer } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { BagService } from "../services/bag.service"

@Resolver("Bag")
export class BagMutationsResolver {
  constructor(private readonly bag: BagService) {}

  @Mutation()
  async upsertCartItem(
    @Select() select,
    @Customer() customer,
    @Args() { productVariantId, addToCart }
  ) {
    return await this.bag.upsertCartItem({
      customerId: customer.id,
      productVariantId,
      select,
      addToCart,
    })
  }
}
