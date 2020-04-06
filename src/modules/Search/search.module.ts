import { Module } from "@nestjs/common"
import { SearchQueriesResolver } from "./queries/search.queries.resolver"
import { SearchResultTypeFieldsResolver } from "./fields/searchResultType.fields.resolver"
import { SearchService } from "./services/search.service"

@Module({
  providers: [
    SearchResultTypeFieldsResolver,
    SearchService,
    SearchQueriesResolver,
  ],
})
export class SearchModule {}
