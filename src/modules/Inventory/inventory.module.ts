import { Module } from "@nestjs/common"
import { OrderQueriesResolver } from "./queries/order.queries.resolver"
import { PrismaModule } from "@app/prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [OrderQueriesResolver],
})
export class InventoryModule {}
