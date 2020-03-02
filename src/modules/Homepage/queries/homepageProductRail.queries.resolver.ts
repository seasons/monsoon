import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { DBService } from "../../../prisma/DB.service"

@Resolver("HomepageProductRail")
export class HomepageProductRailQueriesResolver {
  constructor(private readonly dbService: DBService) {}

  @Query()
  async homepageProductRails(@Args() args, @Info() info) {
    return await this.dbService.query.homepageProductRails(args, info)
  }

  @Query()
  async homepageProductRail(@Args() args, @Info() info) {
    return await this.dbService.query.homepageProductRail(args, info)
  }
}
