import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { CollectionGroupQueriesResolver } from "./queries/collectionGroup.queries.resolver"
import { CollectionQueriesResolver } from "./queries/collection.queries.resolver"

@Module({
  imports: [PrismaModule],
  providers: [
    CollectionGroupQueriesResolver,
    CollectionQueriesResolver
  ],
})
export class CollectionModule {}
