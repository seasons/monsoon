import { CollectionQueriesResolver } from "./"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [CollectionQueriesResolver],
})
export class CollectionModule {}
