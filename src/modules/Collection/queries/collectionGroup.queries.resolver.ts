import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { DBService } from "../../../prisma/db.service"

@Resolver()
export class CollectionGroupQueriesResolver {
  constructor(private readonly db: DBService) {}

  @Query()
  async collectionGroup(@Args() args, @Info() info) {
    return await this.db.query.collectionGroup(args, info)
  }

  @Query()
  async collectionGroups(@Args() args, @Info() info) {
    return await this.db.query.collectionGroups(args, info)
  }
}
