import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { CollectionQueriesResolver } from "."

@Module({
  imports: [PrismaModule],
  providers: [CollectionQueriesResolver],
})
export class CollectionModule {}
