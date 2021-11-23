import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { BagService } from "../services/bag.service"

@Resolver("Bag")
export class BagMutationsResolver {
  constructor(private readonly bag: BagService) {}

  @Mutation()
  async markAsLost(@Args() { lostBagItemId }) {
    return await this.bag.markAsLost(lostBagItemId)
  }

  @Mutation()
  async markAsPickedUp(@Args() { bagItemIds }) {
    return await this.bag.markAsPickedUp(bagItemIds)
  }

  //   @Mutation()
  //   async markAsFound(@Args() { lostBagItemId, status }) {
  //     return await this.bag.markAsFound(lostBagItemId, status)
  //   }
}
