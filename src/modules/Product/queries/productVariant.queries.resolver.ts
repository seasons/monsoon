import { Resolver, Args, Query, Info } from "@nestjs/graphql"
import { DBService } from "../../../prisma/db.service"

@Resolver()
export class ProductVariantQueriesResolver {
  constructor(private readonly db: DBService) {}

  @Query()
  async productVariant(@Args() args, @Info() info) {
    return await this.db.query.productVariant(args, info)
  }
}
