import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("Order")
export class OrderFieldsResolver {
  constructor() {}

  @ResolveField()
  async salesTaxTotal(@Parent() order) {
    return order?.lineItems.reduce((sum, lineItem) => {
      return sum + lineItem.taxPrice
    }, 0)
  }
}
