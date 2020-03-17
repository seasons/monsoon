import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { DBService } from "../../../prisma/DB.service"

@Resolver()
export class HomepageProductRailQueriesResolver {
  constructor(private readonly db: DBService) {}

  @Query()
  async homepageProductRails(@Args() args, @Info() info) {
    return await this.db.query.homepageProductRails(args, info)
  }

  @Query()
  async homepageProductRail(@Args() args, @Info() info) {
    return await this.db.query.homepageProductRail(args, info)
  }
}
