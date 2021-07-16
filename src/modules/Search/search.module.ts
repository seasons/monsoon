import { ImageService } from "@modules/Image/services/image.service"
import { PrismaModule } from "@modules/Prisma/prisma.module"
import { Module } from "@nestjs/common"

import { SearchResultDataFieldsResolver } from "./fields/searchResultData.fields.resolver"
import { SearchQueriesResolver } from "./queries/search.queries.resolver"
import { AlgoliaService } from "./services/algolia.service"
import { SearchService } from "./services/search.service"

@Module({
  providers: [
    SearchResultDataFieldsResolver,
    SearchService,
    SearchQueriesResolver,
    AlgoliaService,
    ImageService,
  ],
  imports: [PrismaModule],
  exports: [SearchService],
})
export class SearchModule {}
