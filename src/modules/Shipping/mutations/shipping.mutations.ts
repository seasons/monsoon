import { Args, Mutation, Resolver } from "@nestjs/graphql"

import { ShippingService } from "../services/shipping.service"

@Resolver()
export class ShippingMutationsResolver {
  constructor(private readonly shippingService: ShippingService) {}

  @Mutation()
  async validateAddress(@Args() { input }) {
    // We deprecated this when we moved from Shippo to UPS. If we need it again, we'd just need to revisit how to
    // get the proper formatting for the expected output on this mutation.
    throw new Error("Deprecated. If needed, need to re-implement")
  }
}
