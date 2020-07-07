import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { SearchResultTypeFieldsResolver } from "./fields/searchResultType.fields.resolver"
import { SearchQueriesResolver } from "./queries/search.queries.resolver"
import { SearchService } from "./services/search.service"

@Module({
  providers: [
    SearchResultTypeFieldsResolver,
    SearchService,
    SearchQueriesResolver,
  ],
  imports: [PrismaModule],
})
export class SearchModule {}
