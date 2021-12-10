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

  @ResolveField()
  async lineItems(@Parent() order) {
    return order?.lineItems.sort((a, b) => {
      return a.recordType === "Package" ? 1 : -1
    })
  }
}
