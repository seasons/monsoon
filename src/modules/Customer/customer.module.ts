import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { CustomerQueriesResolver } from "./queries/customer.queries.resolver"

@Module({
  imports: [PrismaModule],
  providers: [CustomerQueriesResolver],
})
export class CustomerModule {}
