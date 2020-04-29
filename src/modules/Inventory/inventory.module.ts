import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { OrderQueriesResolver } from "./queries/order.queries.resolver"

@Module({
  imports: [PrismaModule],
  providers: [OrderQueriesResolver],
})
export class InventoryModule {}
