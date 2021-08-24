import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { CustomerDetail } from "@prisma/client"

@Resolver("BagItem")
export class BagItemFieldsResolver {
  constructor() {}

  // TODO: Query this as a function of the physical product
  @ResolveField()
  async productVariant(@Parent() bagItem) {
    return null
  }
}
