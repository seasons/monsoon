import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma1/prisma.module"

import { ViewQueriesResolver } from "./queries/view.queries.resolver"

@Module({
  imports: [PrismaModule],
  providers: [ViewQueriesResolver],
  exports: [],
})
export class ViewModule {}
