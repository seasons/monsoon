import { PrismaModule } from "@app/prisma/prisma.module"
import { Module } from "@nestjs/common"

import { ShopifyMutationsResolver } from "./mutations/shopify.mutations"
import { ShopifyQueriesResolver } from "./queries/shopify.queries.resolver"
import { ShopifyService } from "./services/shopify.service"

@Module({
  imports: [PrismaModule],
  providers: [ShopifyService, ShopifyQueriesResolver, ShopifyMutationsResolver],
  exports: [ShopifyService],
})
export class ShopifyModule {}
