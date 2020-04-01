import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { CollectionQueriesResolver } from "./queries/collection.queries.resolver"

@Module({
  imports: [PrismaModule],
  providers: [CollectionQueriesResolver],
})
export class CollectionModule {}
