import { Resolver, Args, Query } from "@nestjs/graphql"
import { prisma } from "../../../prisma"

@Resolver("ProductVariant")
export class ProductVariantQueriesResolver {
  @Query()
  async productVariant(@Args() { where }) {
    return await prisma.productVariant(where)
  }
}
