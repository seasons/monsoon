import { Resolver, Args, Mutation } from "@nestjs/graphql"
import { ShippingService } from "../services/shipping.service"

@Resolver()
export class ShippingMutationsResolver {
  constructor(private readonly shippingService: ShippingService) {}

  @Mutation()
  async validateAddress(@Args() { input }) {
    return await this.shippingService.validateAddress(input)
  }
}
