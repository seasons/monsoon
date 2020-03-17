import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { DBService } from "../../../prisma/DB.service"

@Resolver()
export class CollectionQueriesResolver {
  constructor(private readonly db: DBService) {}

  @Query()
  async collections(@Args() args, @Info() info) {
    return await this.db.query.collections(args, info)
  }

  @Query()
  async collection(@Args() args, @Info() info) {
    return await this.db.query.collection(args, info)
  }
}
