import { Query, Resolver, Args, Info } from "@nestjs/graphql"
import { DBService } from "../../prisma/DB.service"

@Resolver("Category")
export class CategoryResolver {
  constructor(private readonly db: DBService) {}

  @Query()
  async categories(@Args() args, @Info() info) {
    return await this.db.query.categories(args, info)
  }
}
