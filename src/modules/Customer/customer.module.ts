import { CustomerQueriesResolver } from "./queries/customer.queries.resolver"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [CustomerQueriesResolver],
})
export class CustomerModule {}
