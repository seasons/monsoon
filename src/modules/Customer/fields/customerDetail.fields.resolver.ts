import { CustomerDetail } from "@app/prisma"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("CustomerDetail")
export class CustomerDetailFieldsResolver {
  constructor() {}

  @ResolveField()
  async topSizes(@Parent() detail: CustomerDetail) {
    const order = ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]
    return detail.topSizes?.sort((a, b) => order.indexOf(a) - order.indexOf(b))
  }

  @ResolveField()
  async waistSizes(@Parent() detail: CustomerDetail) {
    return detail.waistSizes?.sort()
  }
}
