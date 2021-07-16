import { PrismaModule } from "@modules/Prisma/prisma.module"
import { Module } from "@nestjs/common"

import { ViewQueriesResolver } from "./queries/view.queries.resolver"

@Module({
  imports: [PrismaModule],
  providers: [ViewQueriesResolver],
  exports: [],
})
export class ViewModule {}
